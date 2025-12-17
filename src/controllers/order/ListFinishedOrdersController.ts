import { Request, Response } from "express";
import { ListFinishedOrdersService } from "../../services/order/ListFinishedOrdersService";

class ListFinishedOrdersController {
  async handle(req: Request, res: Response) {
    const listFinishedOrdersService = new ListFinishedOrdersService();

    const orders = await listFinishedOrdersService.execute();

    return res.json(orders);
  }
}

export { ListFinishedOrdersController };

