import { Request, Response } from "express";
import { UpdateCategoryService } from "../../services/category/UpdateCategoryService";
import { updateCategorySchema } from "../../validations/categoryValidations";

class UpdateCategoryController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    
    // Validar dados de entrada
    const validatedData = updateCategorySchema.parse(req.body);
    const { name } = validatedData;

    const updateCategoryService = new UpdateCategoryService();

    const category = await updateCategoryService.execute({
      id: parseInt(id, 10),
      name,
    });

    return res.json(category);
  }
}

export { UpdateCategoryController };

