import { Request, Response } from "express";
import { ListWaitingQueueService } from "../../services/waitingQueue/ListWaitingQueueService";

class ListWaitingQueueController {
  async handle(req: Request, res: Response) {
    const listWaitingQueueService = new ListWaitingQueueService();

    const waitingQueue = await listWaitingQueueService.execute();

    return res.json(waitingQueue);
  }
}

export { ListWaitingQueueController };

