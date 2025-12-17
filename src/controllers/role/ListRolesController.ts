import { Request, Response } from "express";
import { ListRolesService } from "../../services/role/ListRolesService";

class ListRolesController {
  async handle(req: Request, res: Response) {
    const listRolesService = new ListRolesService();

    const roles = await listRolesService.execute();

    return res.json(roles);
  }
}

export { ListRolesController };

