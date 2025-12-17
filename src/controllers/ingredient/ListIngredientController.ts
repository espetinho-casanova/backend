import { Request, Response } from "express";
import { ListIngredientService } from "../../services/ingredient/ListIngredientService";

class ListIngredientController {
  async handle(req: Request, res: Response) {
    const listIngredientService = new ListIngredientService();

    const ingredients = await listIngredientService.execute();

    return res.json(ingredients);
  }
}

export { ListIngredientController };

