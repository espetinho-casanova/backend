import { Request, Response } from "express";
import { DeleteRoleService } from "../../services/role/DeleteRoleService";

class DeleteRoleController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteRoleService = new DeleteRoleService();

    const result = await deleteRoleService.execute(id);

    return res.json(result);
  }
}

export { DeleteRoleController };

