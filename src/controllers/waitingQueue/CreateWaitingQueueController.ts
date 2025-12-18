import { Request, Response } from "express";
import { CreateWaitingQueueService } from "../../services/waitingQueue/CreateWaitingQueueService";
import { z } from "zod";

const createWaitingQueueSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").trim(),
});

class CreateWaitingQueueController {
  async handle(req: Request, res: Response) {
    try {
      const validatedData = createWaitingQueueSchema.parse(req.body);
      const { name } = validatedData;
      const userId = req.userId;

      const createWaitingQueueService = new CreateWaitingQueueService();

      const waitingQueue = await createWaitingQueueService.execute({
        name,
        userId,
      });

      return res.json(waitingQueue);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}

export { CreateWaitingQueueController };

