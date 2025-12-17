import prismaClient from "../../prisma";
import { OrderStatus } from "../../utils/constants";

interface OrderRequest {
  orderId: string;
}

class MarkAsReadyService {
  async execute({ orderId }: OrderRequest) {
    const order = await prismaClient.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.READY,
      },
    });

    return order;
  }
}

export { MarkAsReadyService };


