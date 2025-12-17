import { Request, Response } from "express";
import { UpdateRoleService } from "../../services/role/UpdateRoleService";

class UpdateRoleController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;

    const updateRoleService = new UpdateRoleService();

    const role = await updateRoleService.execute(id, {
      name,
      description,
      permissionIds,
    });

    return res.json(role);
  }
}

export { UpdateRoleController };

