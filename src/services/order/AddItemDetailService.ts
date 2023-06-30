import prismaClient from "../../prisma";

interface ItemDetailRequest {
  observacao: string;
  ponto: string;
  orderItemId: string;
}

class AddItemDetailService {
  async execute({ observacao, orderItemId, ponto }: ItemDetailRequest) {
    const addItemDetail = await prismaClient.orderItemDetail.create({
      data: {
        observacao: observacao,
        ponto: ponto,
        orderItemId: orderItemId,
      },
    });

    console.log("teste");

    return addItemDetail;
  }
}

export { AddItemDetailService };
