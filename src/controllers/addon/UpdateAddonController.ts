import { Request, Response } from "express";
import { UpdateAddonService } from "../../services/addon/UpdateAddonService";
import { updateAddonSchema } from "../../validations/addonValidations";

class UpdateAddonController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    
    // Validar dados de entrada
    const validatedData = updateAddonSchema.parse(req.body);
    const { name, price } = validatedData;

    const updateAddonService = new UpdateAddonService();

    const addon = await updateAddonService.execute({
      id: parseInt(id, 10),
      name,
      price: typeof price === "string" ? parseFloat(price) : price,
    });

    return res.json(addon);
  }
}

export { UpdateAddonController };

