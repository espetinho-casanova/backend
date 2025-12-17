import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";
import { createUserSchema } from "../../validations/userValidations";

class CreateUserController {
  async handle(req: Request, res: Response) {
    const body = {
      ...req.body,
      roleId: req.body.roleId === "" || req.body.roleId === undefined ? null : req.body.roleId,
    };

    const validatedData = createUserSchema.parse(body);
    const { name, login, password, roleId } = validatedData;

    const createUserService = new CreateUserService();

    const user = await createUserService.execute({
      name,
      login,
      password,
      roleId,
    });

    return res.json(user);
  }
}

export { CreateUserController };
