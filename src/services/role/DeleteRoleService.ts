import { prismaClient } from "../../prisma";

class DeleteRoleService {
  async execute(roleId: string) {
    // Verificar se o role existe
    const role = await prismaClient.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error("Cargo não encontrado");
    }

    // Não permitir deletar se houver usuários com esse cargo
    if (role._count.users > 0) {
      throw new Error("Não é possível deletar um cargo que possui usuários associados");
    }

    await prismaClient.role.delete({
      where: { id: roleId },
    });

    return { message: "Cargo deletado com sucesso" };
  }
}

export { DeleteRoleService };

