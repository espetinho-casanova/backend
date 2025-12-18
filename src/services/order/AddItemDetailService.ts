import prismaClient from "../../prisma";

interface ItemDetailRequest {
  observacao: string;
  ponto: string;
  orderItemId: string;
}

class AddItemDetailService {
  async execute({ observacao, orderItemId, ponto }: ItemDetailRequest) {
    const updatedItem = await prismaClient.orderItem.update({
      where: { id: orderItemId },
      data: {
        notes: observacao,
        meatPoint: ponto,
      },
    });

    return updatedItem;
  }
}

export { AddItemDetailService };
