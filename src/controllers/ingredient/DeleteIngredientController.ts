import { Request, Response } from "express";
import { DeleteIngredientService } from "../../services/ingredient/DeleteIngredientService";

class DeleteIngredientController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteIngredientService = new DeleteIngredientService();

    const result = await deleteIngredientService.execute({
      id: Number.parseInt(id, 10),
    });

    return res.json(result);
  }
}

export { DeleteIngredientController };

