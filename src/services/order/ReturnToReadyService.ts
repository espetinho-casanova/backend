import prismaClient from "../../prisma";
import { OrderStatus } from "../../utils/constants";

interface ReturnToReadyRequest {
  orderId: string;
}

class ReturnToReadyService {
  async execute({ orderId }: ReturnToReadyRequest) {
    const order = await prismaClient.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (Number(order.status) !== OrderStatus.FINISHED) {
      throw new Error("Pedido não está entregue");
    }

    await prismaClient.$executeRaw`
      UPDATE orders 
      SET status = ${OrderStatus.READY}, "updatedAt" = NOW()
      WHERE id = ${orderId}
    `;

    const updatedOrder = await prismaClient.order.findUnique({
      where: {
        id: orderId,
      },
    });

    return updatedOrder;
  }
}

export { ReturnToReadyService };

