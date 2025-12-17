import { prismaClient } from "../../prisma";
import { hash } from "bcryptjs";

interface UpdateUserRequest {
  name?: string;
  login?: string;
  password?: string;
  roleId?: string | null;
}

class UpdateUserService {
  async execute(userId: string, { name, login, password, roleId }: UpdateUserRequest) {
    // Verificar se o usuário existe
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Se está tentando atualizar o login, verificar se já existe outro usuário com esse login
    if (login && login !== user.login) {
      const loginExists = await prismaClient.user.findFirst({
        where: {
          login: login,
          NOT: {
            id: userId,
          },
        },
      });

      if (loginExists) {
        throw new Error("Este login já está cadastrado no sistema!");
      }
    }

    // Se está atualizando a senha, fazer hash
    let passwordHash = user.password;
    if (password) {
      passwordHash = await hash(password, 8);
    }

    // Se está atualizando o role, verificar se existe
    if (roleId !== undefined && roleId !== null) {
      const role = await prismaClient.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error("Cargo não encontrado");
      }
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(login && { login }),
        ...(password && { password: passwordHash }),
        ...(roleId !== undefined && { roleId }),
      },
      select: {
        id: true,
        name: true,
        login: true,
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

    return updatedUser;
  }
}

export { UpdateUserService };

