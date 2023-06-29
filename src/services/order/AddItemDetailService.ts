import prismaClient from "../../prisma";

interface ItemDetailRequest {
  observacao: string;
  orderItemId: string;
}

class AddItemDetailService {
  async execute({ observacao, orderItemId }: ItemDetailRequest) {
    const addItemDetail = await prismaClient.orderItemDetail.create({
      data: {
        observacao: observacao,
        orderItemId: orderItemId,
      },
    });

    console.log("teste");

    return addItemDetail;
  }
}

export { AddItemDetailService };
