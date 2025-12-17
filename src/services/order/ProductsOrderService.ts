import prismaClient from "../../prisma";
import { PriceCalculator } from "../../utils/priceCalculator";

interface DetailRequest {
  orderId: string;
}

class ProductsOrderService {
  async execute({ orderId }: DetailRequest) {
    const order = await prismaClient.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: true, // Dados do usuário/garçom
        items: {
          include: {
            product: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true, // Ingredientes do produto
                  },
                },
                addons: {
                  include: {
                    addon: true, // Adicionais permitidos para este produto
                  },
                },
              },
            },
            meatChoice: true, // Carne escolhida (se houver)
            additions: {
              // Adicionais escolhidos no pedido
              include: {
                addon: true, // Dados do adicional escolhido
              },
            },
          },
        },
      },
    });

    const orderItems = order?.items.map((item) => {
      // Calcula o preço total do item usando a regra de negócio correta
      // (Preço Base + Adicionais) * Quantidade
      // OBS: O meatChoice NÃO é somado pois já está incluído no preço do produto principal
      const itemTotal = PriceCalculator.calculateItemTotal(item);

      return {
        id: item.id,
        amount: item.amount,
        orderId: item.orderId,
        productId: item.productId,
        removals: item.removals, // Ingredientes removidos (ex: ["Cebola", "Tomate"])
        notes: item.notes, // Observações (ex: "Bem passado")
        meatPoint: item.meatPoint, // Ponto da carne (ex: "ao ponto", "bem passada")
        takenToTable: item.takenToTable, // Se o item já foi levado para a mesa
        itemTotal: itemTotal, // Preço total do item calculado
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          description: item.product.description,
          banner: item.product.banner,
          available: item.product.available,
          categoryId: item.product.categoryId,
          // Ingredientes do produto (relacionamento N:N)
          ingredients: item.product.ingredients.map((pi) => ({
            id: pi.ingredient.id,
            name: pi.ingredient.name,
            image: pi.ingredient.image,
            nonRemovable: pi.ingredient.nonRemovable, // Se NÃO pode ser removido
          })),
          // Adicionais permitidos para este produto (relacionamento N:N)
          allowedAddons: item.product.addons.map((pa) => ({
            id: pa.addon.id,
            name: pa.addon.name,
            price: pa.addon.price,
            image: pa.addon.image,
          })),
        },
        // Carne escolhida para Xis/Ká (se houver)
        meatChoice: item.meatChoice
          ? {
            id: item.meatChoice.id,
            name: item.meatChoice.name,
            price: item.meatChoice.price,
            banner: item.meatChoice.banner,
          }
          : null,
        // Adicionais escolhidos no pedido (ex: Ovo Extra, Bacon Extra)
        additions: item.additions.map((orderAddon) => ({
          id: orderAddon.id,
          addon: {
            id: orderAddon.addon.id,
            name: orderAddon.addon.name,
            price: orderAddon.addon.price,
            image: orderAddon.addon.image,
          },
        })),
      };
    });

    // Calcula o total geral do pedido
    const orderTotal = order?.items
      ? PriceCalculator.calculateOrderTotal(order.items)
      : 0;

    // Verificar se o user foi carregado
    const userName = order?.user?.name || null;

    return {
      order: {
        id: order?.id,
        table: order?.table,
        status: order?.status,
        draft: order?.draft,
        name: order?.name,
        userId: order?.userId,
        userName: userName, // Nome do garçom
        orderTotal: orderTotal, // Total do pedido
        orderTotalFormatted: PriceCalculator.formatPrice(orderTotal), // Total formatado
      },
      orderItems: orderItems ?? [],
    };
  }
}

export { ProductsOrderService };
