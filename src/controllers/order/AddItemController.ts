import { Request, Response } from "express";
import { AddItemService } from "../../services/order/AddItemService";

class AddItemController {
  async handle(req: Request, res: Response) {
    const { amount, orderId, productId, client } = req.body;

    const addItemService = new AddItemService();

    const order = await addItemService.execute({
      amount,
      orderId,
      productId,
      client,
    });

    return res.json(order);
  }
}

export { AddItemController };