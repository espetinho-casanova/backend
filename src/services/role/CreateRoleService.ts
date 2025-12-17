import { prismaClient } from "../../prisma";

interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

class CreateRoleService {
  async execute({ name, description, permissionIds }: CreateRoleRequest) {
    const roleExists = await prismaClient.role.findFirst({
      where: { name },
    });

    if (roleExists) {
      throw new Error("Já existe um cargo com este nome!");
    }

    if (permissionIds.length > 0) {
      const permissions = await prismaClient.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error("Uma ou mais permissões não foram encontradas");
      }
    }

    const role = await prismaClient.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return role;
  }
}

export { CreateRoleService };

