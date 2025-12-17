import { Request, Response } from "express";
import { CreateOrderService } from "../../services/order/CreateOrderService";
import { createOrderSchema } from "../../validations/orderValidations";

class CreateOrderController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = createOrderSchema.parse(req.body);
    const { table, status, draft, items } = validatedData;

    const userId = req.userId;

    const createOrderService = new CreateOrderService();

    const order = await createOrderService.execute({
      table,
      userId,
      draft,
      status,
      items, // Array de itens do pedido (opcional)
    });

    return res.json(order);
  }
}

export { CreateOrderController };