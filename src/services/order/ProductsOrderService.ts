import prismaClient from "../../prisma";

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
        items: {
          include: {
            product: true,
            observacoes: true, // Inclui os detalhes de cada item
          },
        },
      },
    });

    const orderItems = order?.items.map((item) => {
      const orderItemDetails = item.observacoes.map((detail) => ({
        id: detail.id,
        observacao: detail.observacao,
        itemId: detail.orderItemId,
      }));

      return {
        id: item.id,
        amount: item.amount,
        orderId: item.orderId,
        productId: item.productId,
        product: {
          id: item?.product.id,
          name: item?.product.name,
          price: item?.product.price,
          description: item?.product.description,
          banner: item?.product.banner,
          available: item?.product.available,
          categoryId: item?.product.categoryId,
          orderItemDetails: orderItemDetails, // Adiciona os detalhes do item
        },
      };
    });

    return {
      order: {
        id: order?.id,
        table: order?.table,
        status: order?.status,
        draft: order?.draft,
        name: order?.name,
        userId: order?.userId,
      },
      orderItems: orderItems ?? [],
    };
  }
}

export { ProductsOrderService };
