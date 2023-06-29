import prismaClient from "../../prisma";

interface ItemRequest {
  orderItemId: string;
}

class RemoveItemService {
  async execute({ orderItemId }: ItemRequest) {
    //verificar se o item tem algum detalhe
    const itemDetails = await prismaClient.orderItemDetail.findMany({
      where: {
        orderItemId: orderItemId,
      },
    });

    //deletar tambem os detalhes de um pedido que foi deletado caso houver
    if (itemDetails.length > 0) {
      const itemDetails = await prismaClient.orderItemDetail.deleteMany({
        where: {
          orderItemId: orderItemId,
        },
      });
    }

    const order = await prismaClient.orderItem.delete({
      where: {
        id: orderItemId,
      },
    });

    return order;
  }
}

export { RemoveItemService };
