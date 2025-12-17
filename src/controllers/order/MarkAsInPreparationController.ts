import { Request, Response } from "express";
import { MarkAsInPreparationService } from "../../services/order/MarkAsInPreparationService";
import { ListOrdersService } from "../../services/order/ListOrdersService";
import { orderEventService } from "../../services/order/OrderEventService";

class MarkAsInPreparationController {
    async handle(req: Request, res: Response) {
        const { orderId } = req.body;

        const markAsInPreparationService = new MarkAsInPreparationService();

        const order = await markAsInPreparationService.execute({
            orderId,
        });

        try {
            const listOrdersService = new ListOrdersService();
            const orders = await listOrdersService.execute();
            orderEventService.notifyOrdersUpdate(orders);
        } catch (sseError) {
            if (process.env.NODE_ENV !== "production") {
                console.error("Erro ao notificar SSE:", sseError);
            }
        }

        return res.json(order);
    }
}

export { MarkAsInPreparationController };

