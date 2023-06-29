import prismaClient from "../../prisma";

interface OrderRequest {
  orderId: string;
}

class FinishOrderService {
  async execute({ orderId }: OrderRequest) {
    const order = await prismaClient.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: 2,
      },
    });

    return order;
  }
}

export { FinishOrderService };
