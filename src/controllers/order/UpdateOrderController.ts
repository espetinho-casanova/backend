import { Request, Response } from "express";
import { UpdateOrderService } from "../../services/order/UpdateOrderService";
import { updateOrderSchema } from "../../validations/orderValidations";

class UpdateOrderController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = updateOrderSchema.parse(req.body);
    const { orderId, table } = validatedData;

    const updateOrderService = new UpdateOrderService();

    const order = await updateOrderService.execute({
      orderId,
      table,
    });

    return res.json(order);
  }
}

export { UpdateOrderController };

