import prismaClient from "../../prisma";
import { hash } from "bcryptjs";

interface UserRequest {
  name: string;
  login: string;
  password: string;
}

class CreateUserService {
  async execute({ name, login, password }: UserRequest) {
    //Verificar se enviou um login
    if (!login) {
      throw new Error("Preencha o campo login!");
    }

    //verificar se esse login já está cadastrado na plataforma
    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        login: login,
      },
    });

    if (userAlreadyExists) {
      throw new Error("Este login já cadastrado no sistema!");
    }

    const passwordHash = await hash(password, 8);

    const user = await prismaClient.user.create({
      data: {
        name: name,
        login: login,
        password: passwordHash,
      },
      select: {
        id: true,
        login: true,
        name: true,
      },
    });

    return user;
  }
}

export { CreateUserService };
