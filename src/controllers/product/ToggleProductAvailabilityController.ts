import { Request, Response } from "express";
import { ToggleProductAvailabilityService } from "../../services/product/ToggleProductAvailabilityService";

class ToggleProductAvailabilityController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const toggleProductAvailabilityService =
        new ToggleProductAvailabilityService();

      const updatedProduct = await toggleProductAvailabilityService.execute({
        id: parseInt(id),
      });

      return res.json(updatedProduct);
    } catch (error: any) {
      // Erro será tratado pelo middleware global de erros
      throw error;
    }
  }
}

export { ToggleProductAvailabilityController };

