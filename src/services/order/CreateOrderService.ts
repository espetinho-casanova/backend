import prismaClient from "../../prisma";
import { OrderStatus } from "../../utils/constants";

interface OrderItemRequest {
  productId: number;
  amount: number;
  meatChoiceId?: number; // Opcional: para Xis/Ká que precisam de escolha de carne
  meatPoint?: string; // Opcional: ponto da carne (mal passada, . pra mal, ao ponto, . pra bem, bem passada)
  removals?: string[]; // Opcional: ingredientes removidos (ex: ["Cebola", "Tomate"])
  additions?: number[]; // Opcional: IDs de adicionais (Addon) escolhidos (ex: [1, 2] para Ovo e Bacon)
  notes?: string; // Opcional: observações livres
}

interface OrderRequest {
  table: string; // Mesa/Nome (obrigatório, pode ser número ou nome)
  status?: number;
  draft?: boolean;
  userId: string;
  items?: OrderItemRequest[]; // Itens do pedido (opcional para criar pedido vazio)
}

/**
 * Serviço para criação de pedidos
 * 
 * @description
 * Este serviço cria pedidos de forma atômica, garantindo que:
 * - A validação de estoque seja feita ANTES de criar o pedido
 * - O pedido e a diminuição de estoque sejam feitos na mesma transação
 * - Se qualquer operação falhar, tudo é revertido
 */
class CreateOrderService {
  /**
   * Cria um novo pedido com validação completa de estoque
   * 
   * @param table - Mesa/Nome (obrigatório, pode ser número ou nome)
   * @param status - Status inicial do pedido (padrão: DRAFT)
   * @param draft - Se o pedido é rascunho (padrão: true)
   * @param userId - ID do usuário que está criando o pedido
   * @param items - Array de itens do pedido (opcional)
   * @returns Pedido criado com todos os relacionamentos
   * @throws Error se houver problema de estoque ou validação
   */
  async execute({ table, status, draft, userId, items }: OrderRequest) {
    // Validar produtos e estoque ANTES de criar o pedido
    if (items && items.length > 0) {
      // Coletar todos os IDs de produtos únicos para validação em batch
      const productIds = new Set<number>();
      const meatChoiceIds = new Set<number>();

      for (const item of items) {
        productIds.add(item.productId);
        if (item.meatChoiceId) {
          meatChoiceIds.add(item.meatChoiceId);
        }
      }

      // Buscar todos os produtos de uma vez (otimização: 1 query ao invés de N)
      const allProductIds = Array.from(new Set([...productIds, ...meatChoiceIds]));
      const products = await prismaClient.product.findMany({
        where: { id: { in: allProductIds } },
      });

      // Criar mapa para acesso O(1) aos produtos
      const productsMap = new Map(products.map(p => [p.id, p]));

      // Validar cada item
      for (const item of items) {
        const product = productsMap.get(item.productId);
        
        // Validar se produto existe
        if (!product) {
          throw new Error(`Produto com ID ${item.productId} não encontrado`);
        }

        // Validar se produto está disponível
        if (!product.available) {
          throw new Error(`Produto "${product.name}" não está disponível`);
        }

        // Validar estoque do produto principal
        if (product.stock < item.amount) {
          throw new Error(
            `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, Solicitado: ${item.amount}`
          );
        }

        // Validar espetinho escolhido (se houver)
        if (item.meatChoiceId) {
          const meatChoice = productsMap.get(item.meatChoiceId);

          if (!meatChoice) {
            throw new Error(`Espetinho com ID ${item.meatChoiceId} não encontrado`);
          }

          if (!meatChoice.canBeUsedInSandwich) {
            throw new Error(
              `O espetinho "${meatChoice.name}" não pode ser usado no lanche (Xis/Ká)`
            );
          }

          if (!meatChoice.available) {
            throw new Error(`Espetinho "${meatChoice.name}" não está disponível`);
          }

          if (meatChoice.stock < item.amount) {
            throw new Error(
              `Estoque insuficiente para espetinho "${meatChoice.name}". Disponível: ${meatChoice.stock}, Solicitado: ${item.amount}`
            );
          }
        }
      }
    }

    // Usar transação atômica para garantir consistência
    const order = await prismaClient.$transaction(async (tx) => {
      // Cria o pedido com os itens usando Nested Writes do Prisma
      const createdOrder = await tx.order.create({
        data: {
          table: table,
          status: status ?? OrderStatus.DRAFT,
          draft: draft ?? true,
          userId: userId,
          // Se tiver itens, cria eles junto com o pedido (transação única)
          items: items
            ? {
              create: items.map((item) => ({
                productId: item.productId,
                amount: item.amount,
                meatChoiceId: item.meatChoiceId, // Carne escolhida para Xis/Ká
                meatPoint: item.meatPoint, // Ponto da carne
                removals: item.removals ?? [], // Ingredientes removidos
                notes: item.notes, // Observações
                // Se houver adicionais, cria os registros na tabela OrderItemAddon
                additions: item.additions
                  ? {
                    create: item.additions.map((addonId) => ({
                      addonId: addonId, // Agora usa addonId ao invés de productId
                    })),
                  }
                  : undefined,
              })),
            }
            : undefined,
        },
        // Inclui os relacionamentos na resposta
        include: {
          items: {
            include: {
              product: true, // Produto principal
              meatChoice: true, // Carne escolhida (se houver)
              additions: {
                include: {
                  addon: true, // Adicionais escolhidos
                },
              },
            },
          },
        },
      });

      // Diminuir estoque de produtos e espetos dentro da mesma transação
      if (items && items.length > 0) {
        await this.decreaseStockForOrderItems(items, tx);
      }

      return createdOrder;
    });

    return order;
  }

  // Diminui o estoque apenas de produtos e espetos
  private async decreaseStockForOrderItems(items: OrderItemRequest[], tx?: any) {
    const prisma = tx || prismaClient;
    
    for (const item of items) {
      // 1. Diminui estoque do PRODUTO principal
      await this.decreaseProductStock(item.productId, item.amount, prisma);

      // 2. Diminui estoque do ESPETO escolhido (se houver)
      if (item.meatChoiceId) {
        await this.decreaseProductStock(item.meatChoiceId, item.amount, prisma);
      }

      // ❌ NÃO diminui estoque de ingredientes (ingredientes não têm estoque)
    }
  }

  // Diminui o estoque de um produto e desabilita se chegar a 0
  private async decreaseProductStock(productId: number, quantity: number, tx?: any) {
    const prisma = tx || prismaClient;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return;
    }

    // Validar estoque antes de diminuir
    if (product.stock < quantity) {
      throw new Error(`Estoque insuficiente para o produto ID ${productId}. Disponível: ${product.stock}, Solicitado: ${quantity}`);
    }

    // Calcula novo estoque
    const newStock = product.stock - quantity;

    // Atualiza o estoque
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        // Se estoque chegou a 0, desabilita o produto
        available: newStock > 0,
      },
    });
  }
}

export { CreateOrderService };
