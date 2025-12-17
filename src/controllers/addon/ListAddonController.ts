import { Request, Response } from "express";
import { ListAddonService } from "../../services/addon/ListAddonService";

class ListAddonController {
  async handle(req: Request, res: Response) {
    const listAddonService = new ListAddonService();

    const addons = await listAddonService.execute();

    return res.json(addons);
  }
}

export { ListAddonController };

