import { Request, Response } from "express";
import { UpdateUserService } from "../../services/user/UpdateUserService";

class UpdateUserController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, login, password, roleId } = req.body;

    const updateUserService = new UpdateUserService();

    const user = await updateUserService.execute(id, {
      name,
      login,
      password,
      roleId,
    });

    return res.json(user);
  }
}

export { UpdateUserController };

