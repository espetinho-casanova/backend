import { Request, Response } from "express";
import { AddItemDetailService } from "../../services/order/AddItemDetailService";

class AddItemDetailController {
  async handle(req: Request, res: Response) {
    const { observacao, orderItemId, ponto } = req.body;

    const addItemDetailService = new AddItemDetailService();

    const itemDetail = await addItemDetailService.execute({
      observacao,
      ponto,
      orderItemId,
    });

    return res.json(itemDetail);
  }
}

export { AddItemDetailController };