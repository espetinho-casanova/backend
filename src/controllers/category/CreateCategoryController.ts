import { Request, Response } from "express";
import { CreateCategoryService } from "../../services/category/CreateCategoryService";
import { createCategorySchema } from "../../validations/categoryValidations";

class CreateCategoryController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = createCategorySchema.parse(req.body);
    const { name } = validatedData;

    const createCategoryService = new CreateCategoryService();

    const category = await createCategoryService.execute({
      name,
    });

    return res.json(category);
  }
}

export { CreateCategoryController };