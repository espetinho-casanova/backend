import { Request, Response } from "express";
import { MarkAsReadyService } from "../../services/order/MarkAsReadyService";
import { ListOrdersService } from "../../services/order/ListOrdersService";
import { orderEventService } from "../../services/order/OrderEventService";

class MarkAsReadyController {
  async handle(req: Request, res: Response) {
    const { orderId } = req.body;

    const markAsReadyService = new MarkAsReadyService();

    const order = await markAsReadyService.execute({
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

export { MarkAsReadyController };


