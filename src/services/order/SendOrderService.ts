import prismaClient from "../../prisma";

interface orderResquest {
  orderId: string;
}

class SendOrderService {
  async execute({ orderId }: orderResquest) {
    const order = await prismaClient.order.update({
      where: {
        id: orderId,
      },
      data: {
        draft: false,
        status: 1,
      },
    });

    return order;
  }
}

export { SendOrderService };
