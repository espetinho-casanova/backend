import { Request, Response } from "express";
import { DeleteUserService } from "../../services/user/DeleteUserService";

class DeleteUserController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.userId;

    if (id === userId) {
      return res.status(400).json({ error: "Você não pode deletar seu próprio usuário" });
    }

    const deleteUserService = new DeleteUserService();

    const result = await deleteUserService.execute(id);

    return res.json(result);
  }
}

export { DeleteUserController };

