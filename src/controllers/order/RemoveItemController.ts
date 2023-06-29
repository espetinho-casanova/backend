import { Request, Response } from "express";
import { RemoveItemService } from "../../services/order/RemoveItemService";

class RemoveItemController {
  async handle(req: Request, res: Response) {
    const { orderItemId } = req.body;

    const removeItemService = new RemoveItemService();

    const order = removeItemService.execute({
      orderItemId,
    });

    return res.json("Produto deletado!");
  }
}

export { RemoveItemController };
