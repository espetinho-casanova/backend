import { Request, Response } from "express";
import { CreateProductService } from "../../services/product/CreateProductService";
import { createProductSchema } from "../../validations/productValidations";

class CreateProductController {
  async handle(req: Request, res: Response) {
    if (!req.file) {
      throw new Error("Error upload a file!");
    }

    // Validar dados de entrada
    const validatedData = createProductSchema.parse(req.body);
    const {
      name,
      price,
      description,
      categoryId,
      ingredientIds,
      addonIds,
      canBeUsedInSandwich,
      hasMeatPoint,
    } = validatedData;

    const { filename: banner } = req.file;

    // Parse dos dados validados
    const parsedIngredientIds = ingredientIds
      ? JSON.parse(ingredientIds).map((id: string) => parseInt(id, 10))
      : [];
    const parsedAddonIds = addonIds
      ? JSON.parse(addonIds).map((id: string) => parseInt(id, 10))
      : [];
    const parsedCanBeUsedInSandwich = canBeUsedInSandwich !== undefined
      ? (typeof canBeUsedInSandwich === "string" ? canBeUsedInSandwich === "true" : Boolean(canBeUsedInSandwich))
      : true;
    const parsedHasMeatPoint = hasMeatPoint !== undefined
      ? (typeof hasMeatPoint === "string" ? hasMeatPoint === "true" : Boolean(hasMeatPoint))
      : false;

    const createProductService = new CreateProductService();

    const product = await createProductService.execute({
      name,
      price: parseFloat(price),
      description,
      banner,
      categoryId: parseInt(categoryId, 10),
      ingredientIds: parsedIngredientIds,
      addonIds: parsedAddonIds,
      canBeUsedInSandwich: parsedCanBeUsedInSandwich,
      hasMeatPoint: parsedHasMeatPoint,
    });

    return res.json(product);
  }
}

export { CreateProductController };
