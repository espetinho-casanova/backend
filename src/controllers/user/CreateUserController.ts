import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    const { name, login, password } = req.body;

    const createUserService = new CreateUserService();

    const user = await createUserService.execute({
      name,
      login,
      password,
    });

    return res.json(user);
  }
}

export { CreateUserController };
