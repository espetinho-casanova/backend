import { Request, Response } from "express";
import { CreateIngredientService } from "../../services/ingredient/CreateIngredientService";
import { createIngredientSchema } from "../../validations/ingredientValidations";

class CreateIngredientController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = createIngredientSchema.parse(req.body);
    const { name, nonRemovable } = validatedData;

    const createIngredientService = new CreateIngredientService();

    const ingredient = await createIngredientService.execute({
      name,
      nonRemovable: nonRemovable ?? false,
    });

    return res.json(ingredient);
  }
}

export { CreateIngredientController };

