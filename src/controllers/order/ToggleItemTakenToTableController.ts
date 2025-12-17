import { Request, Response } from "express";
import { ToggleItemTakenToTableService } from "../../services/order/ToggleItemTakenToTableService";
import { z } from "zod";

const toggleItemTakenToTableSchema = z.object({
  itemId: z.string().uuid("ID do item inválido"),
  takenToTable: z.boolean(),
});

class ToggleItemTakenToTableController {
  async handle(req: Request, res: Response) {
    try {
      const validatedData = toggleItemTakenToTableSchema.parse(req.body);

      const toggleItemTakenToTableService = new ToggleItemTakenToTableService();

      const item = await toggleItemTakenToTableService.execute(validatedData);

      return res.json(item);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ToggleItemTakenToTableController };

