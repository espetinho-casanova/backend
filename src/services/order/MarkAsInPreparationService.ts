import prismaClient from "../../prisma";
import { OrderStatus } from "../../utils/constants";

interface OrderRequest {
  orderId: string;
}

class MarkAsInPreparationService {
    async execute({ orderId }: OrderRequest) {
        const order = await prismaClient.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: OrderStatus.IN_PREPARATION,
            },
        });

        return order;
    }
}

export { MarkAsInPreparationService };

