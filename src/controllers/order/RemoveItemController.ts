import { Request, Response } from "express";
import { RemoveItemService } from "../../services/order/RemoveItemService";
import { removeItemSchema } from "../../validations/orderValidations";

class RemoveItemController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = removeItemSchema.parse(req.body);
    const { orderItemId } = validatedData;

    const removeItemService = new RemoveItemService();

    await removeItemService.execute({
      orderItemId,
    });

    return res.json("Produto deletado!");
  }
}

export { RemoveItemController };
