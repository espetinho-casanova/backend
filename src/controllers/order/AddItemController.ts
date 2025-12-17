import { Request, Response } from "express";
import { AddItemService } from "../../services/order/AddItemService";
import { addItemSchema } from "../../validations/orderValidations";

class AddItemController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = addItemSchema.parse(req.body);
    const {
      amount,
      orderId,
      productId,
      meatChoiceId,
      meatPoint,
      removals,
      additions,
      notes,
    } = validatedData;

    const addItemService = new AddItemService();

    const orderItem = await addItemService.execute({
      amount,
      orderId,
      productId,
      meatChoiceId,
      meatPoint,
      removals,
      additions,
      notes,
    });

    return res.json(orderItem);
  }
}

export { AddItemController };