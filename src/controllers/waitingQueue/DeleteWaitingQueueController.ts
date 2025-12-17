import { Request, Response } from "express";
import { DeleteWaitingQueueService } from "../../services/waitingQueue/DeleteWaitingQueueService";
import { z } from "zod";

const deleteWaitingQueueSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

class DeleteWaitingQueueController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = deleteWaitingQueueSchema.parse({ id });

      const deleteWaitingQueueService = new DeleteWaitingQueueService();

      await deleteWaitingQueueService.execute(validatedData);

      return res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}

export { DeleteWaitingQueueController };

