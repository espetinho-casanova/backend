import { Request, Response } from "express";
import { UpdateIngredientService } from "../../services/ingredient/UpdateIngredientService";
import { updateIngredientSchema } from "../../validations/ingredientValidations";

class UpdateIngredientController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    
    // Validar dados de entrada
    const validatedData = updateIngredientSchema.parse(req.body);
    const { name, nonRemovable } = validatedData;

    const updateIngredientService = new UpdateIngredientService();

    const ingredient = await updateIngredientService.execute({
      id: parseInt(id, 10),
      name,
      nonRemovable: nonRemovable ?? false,
    });

    return res.json(ingredient);
  }
}

export { UpdateIngredientController };

