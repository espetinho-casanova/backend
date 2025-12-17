import { Request, Response } from "express";
import { ListPermissionsService } from "../../services/permission/ListPermissionsService";

class ListPermissionsController {
  async handle(req: Request, res: Response) {
    const listPermissionsService = new ListPermissionsService();

    const permissions = await listPermissionsService.execute();

    return res.json(permissions);
  }
}

export { ListPermissionsController };

