import { Request, Response } from "express";
import { DeleteAddonService } from "../../services/addon/DeleteAddonService";

class DeleteAddonController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteAddonService = new DeleteAddonService();

    const result = await deleteAddonService.execute({
      id: Number.parseInt(id, 10),
    });

    return res.json(result);
  }
}

export { DeleteAddonController };

