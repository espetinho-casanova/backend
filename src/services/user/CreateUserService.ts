import prismaClient from "../../prisma";
import { hash } from "bcryptjs";

interface UserRequest {
  name: string;
  login: string;
  password: string;
  roleId?: string | null;
}

class CreateUserService {
  async execute({ name, login, password, roleId }: UserRequest) {
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

    // Se está definindo um role, verificar se existe
    if (roleId) {
      const role = await prismaClient.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error("Cargo não encontrado");
      }
    }

    const user = await prismaClient.user.create({
      data: {
        name: name,
        login: login,
        password: passwordHash,
        roleId: roleId || null,
      },
      select: {
        id: true,
        login: true,
        name: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return user;
  }
}

export { CreateUserService };
