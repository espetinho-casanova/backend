import { Request, Response } from "express";
import { CreateAddonService } from "../../services/addon/CreateAddonService";
import { createAddonSchema } from "../../validations/addonValidations";

class CreateAddonController {
  async handle(req: Request, res: Response) {
    // Validar dados de entrada
    const validatedData = createAddonSchema.parse(req.body);
    const { name, price, image } = validatedData;

    const createAddonService = new CreateAddonService();

    const addon = await createAddonService.execute({
      name,
      price,
      image,
    });

    return res.json(addon);
  }
}

export { CreateAddonController };

