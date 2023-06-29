import { Request, Response } from "express";
import { CreateOrderService } from "../../services/order/CreateOrderService";

class CreateOrderController {
  async handle(req: Request, res: Response) {
    const { table, name, status, draft } = req.body;

    const userId = req.userId;

    const createOrderController = new CreateOrderService();

    const order = await createOrderController.execute({
      table,
      name,
      userId,
      draft,
      status,
    });

    return res.json(order);
  }
}

export { CreateOrderController };