import { prismaClient } from "../../prisma";

interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

class UpdateRoleService {
  async execute(roleId: string, { name, description, permissionIds }: UpdateRoleRequest) {
    // Verificar se o role existe
    const role = await prismaClient.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error("Cargo não encontrado");
    }

    // Se está tentando atualizar o nome, verificar se já existe outro role com esse nome
    if (name && name !== role.name) {
      const nameExists = await prismaClient.role.findFirst({
        where: {
          name: name,
          NOT: {
            id: roleId,
          },
        },
      });

      if (nameExists) {
        throw new Error("Já existe um cargo com este nome!");
      }
    }

    // Se está atualizando permissões, verificar se todas existem
    if (permissionIds !== undefined) {
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

      // Remover todas as permissões antigas e adicionar as novas
      await prismaClient.rolePermission.deleteMany({
        where: { roleId },
      });
    }

    const updatedRole = await prismaClient.role.update({
      where: { id: roleId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissionIds !== undefined && {
          permissions: {
            create: permissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        }),
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return updatedRole;
  }
}

export { UpdateRoleService };

