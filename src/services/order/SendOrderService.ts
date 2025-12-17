import prismaClient from "../../prisma";
import { OrderStatus } from "../../utils/constants";

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
        status: OrderStatus.IN_PREPARATION,
      },
    });

    return order;
  }
}

export { SendOrderService };
