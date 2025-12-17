import { Request, Response } from "express";
import { FinishOrderService } from "../../services/order/FinishOrderService";
import { ListOrdersService } from "../../services/order/ListOrdersService";
import { orderEventService } from "../../services/order/OrderEventService";

class FinishOrderController {
  async handle(req: Request, res: Response) {
    const { orderId } = req.body;

    const finishOrderService = new FinishOrderService();

    const order = await finishOrderService.execute({
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

export { FinishOrderController };