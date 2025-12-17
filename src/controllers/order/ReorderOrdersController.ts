import { Request, Response } from "express";
import { ReorderOrdersService } from "../../services/order/ReorderOrdersService";
import { z } from "zod";

const reorderOrdersSchema = z.object({
  orderIds: z.array(z.string().uuid("ID do pedido deve ser um UUID válido")).min(1, "Deve ter pelo menos um pedido"),
});

class ReorderOrdersController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = reorderOrdersSchema.parse(req.body);
    const { orderIds } = validatedData;

    const reorderOrdersService = new ReorderOrdersService();

    await reorderOrdersService.execute({
      orderIds,
    });

    return res.json({ success: true });
  }
}

export { ReorderOrdersController };

