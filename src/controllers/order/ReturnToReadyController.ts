import { Request, Response } from "express";
import { ReturnToReadyService } from "../../services/order/ReturnToReadyService";
import { ListOrdersService } from "../../services/order/ListOrdersService";
import { orderEventService } from "../../services/order/OrderEventService";
import { z } from "zod";

const returnToReadySchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
});

class ReturnToReadyController {
  async handle(req: Request, res: Response) {
    try {
      const validatedData = returnToReadySchema.parse(req.body);
      const { orderId } = validatedData;

      const returnToReadyService = new ReturnToReadyService();
      const order = await returnToReadyService.execute({ orderId });

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
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ReturnToReadyController };

