import prismaClient from "../../prisma";
import { OrderStatus } from "../../utils/constants";

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
        status: OrderStatus.FINISHED,
      },
    });

    return order;
  }
}

export { FinishOrderService };
