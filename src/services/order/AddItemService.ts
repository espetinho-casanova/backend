import prismaClient from "../../prisma";
import { validateMeatChoice } from "../../utils/orderValidation";

interface ItemRequest {
  amount: number;
  orderId: string;
  productId: number;
  meatChoiceId?: number; // Opcional: para Xis/Ká que precisam de escolha de carne
  meatPoint?: string; // Opcional: ponto da carne (mal passada, . pra mal, ao ponto, . pra bem, bem passada)
  removals?: string[]; // Opcional: ingredientes removidos (ex: ["Cebola", "Tomate"])
  additions?: number[]; // Opcional: IDs de adicionais (Addon) escolhidos (ex: [1, 2] para Ovo e Bacon)
  notes?: string; // Opcional: observações livres
}

/**
 * Serviço para adicionar um item a um pedido existente
 * 
 * @description
 * Adiciona um novo item a um pedido já criado, validando estoque
 * e diminuindo o estoque dentro de uma transação atômica.
 */
class AddItemService {
  /**
   * Adiciona um item a um pedido existente
   * 
   * @param amount - Quantidade do item
   * @param orderId - ID do pedido
   * @param productId - ID do produto principal
   * @param meatChoiceId - ID do espetinho escolhido (opcional, para Xis/Ká)
   * @param meatPoint - Ponto da carne (opcional)
   * @param removals - Ingredientes removidos (opcional)
   * @param additions - IDs dos adicionais escolhidos (opcional)
   * @param notes - Observações do item (opcional)
   * @returns Item criado com todos os relacionamentos
   * @throws Error se houver problema de estoque ou validação
   */
  async execute({
    amount,
    orderId,
    productId,
    meatChoiceId,
    meatPoint,
    removals,
    additions,
    notes,
  }: ItemRequest) {
    // Validar se o pedido existe antes de adicionar item
    const orderExists = await prismaClient.order.findUnique({
      where: { id: orderId },
    });

    if (!orderExists) {
      throw new Error(`Pedido com ID ${orderId} não encontrado`);
    }

    // Validar produtos e estoque ANTES de adicionar o item
    const product = await prismaClient.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Produto com ID ${productId} não encontrado`);
    }

    if (!product.available) {
      throw new Error(`Produto "${product.name}" não está disponível`);
    }

    if (product.stock < amount) {
      throw new Error(
        `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, Solicitado: ${amount}`
      );
    }

    // Validar espetinho escolhido usando função utilitária
    if (meatChoiceId) {
      await validateMeatChoice({
        meatChoiceId,
        amount,
        productName: product.name,
      });
    }

    // Usar transação atômica para criar item e diminuir estoque
    const orderItem = await prismaClient.$transaction(async (tx) => {
      // Criar o item do pedido
      const createdItem = await tx.orderItem.create({
        data: {
          orderId: orderId,
          productId: productId,
          amount: amount,
          meatChoiceId: meatChoiceId, // Carne escolhida para Xis/Ká
          meatPoint: meatPoint, // Ponto da carne
          removals: removals ?? [], // Ingredientes removidos
          notes: notes, // Observações
          // Se houver adicionais, cria os registros na tabela OrderItemAddon
          additions: additions
            ? {
              create: additions.map((addonId) => ({
                addonId: addonId, // Agora usa addonId ao invés de productId
              })),
            }
            : undefined,
        },
        // Inclui os relacionamentos na resposta
        include: {
          product: true, // Produto principal
          meatChoice: true, // Carne escolhida (se houver)
          additions: {
            include: {
              addon: true, // Adicionais escolhidos
            },
          },
        },
      });

      // Diminuir estoque do produto principal
      await this.decreaseProductStock(productId, amount, tx);

      // Diminuir estoque do espetinho (se houver)
      if (meatChoiceId) {
        await this.decreaseProductStock(meatChoiceId, amount, tx);
      }

      return createdItem;
    });

    return orderItem;
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

export { AddItemService };
