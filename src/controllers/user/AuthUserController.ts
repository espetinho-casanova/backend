import { Request, Response } from "express";
import { AuthUserService } from "../../services/user/AuthUserService";
import { authUserSchema } from "../../validations/userValidations";

class AuthUserController {
  async handle(req: Request, res: Response) {
    const validatedData = authUserSchema.parse(req.body);
    const { login, password } = validatedData;

    const authUserService = new AuthUserService();

    const auth = await authUserService.execute({
      login,
      password,
    });

    return res.json(auth);
  }
}

export { AuthUserController };
