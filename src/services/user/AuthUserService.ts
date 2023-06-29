import prismaClient from "../../prisma";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

interface AuthRequest {
  login: string;
  password: string;
}

class AuthUserService {
  async execute({ login, password }: AuthRequest) {
    //Verificar se o login existe
    const user = await prismaClient.user.findFirst({
      where: {
        login: login,
      },
    });

    if (!user) {
      throw new Error("login/password incorrect");
    }

    //verificar se a senha está correta.
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("login/password incorrect");
    }

    //Gerar o token se deu tudo certo
    const token = sign(
      {
        name: user.name,
        login: user.login,
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "30d",
      }
    );

    return {
      id: user.id,
      name: user.name,
      login: user.login,
      token: token,
    };
  }
}

export { AuthUserService };
