import { prismaClient } from "../../prisma";

class DeleteUserService {
  async execute(userId: string) {
    // Verificar se o usuário existe
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Não permitir deletar o próprio usuário (seria verificado no controller)
    await prismaClient.user.delete({
      where: { id: userId },
    });

    return { message: "Usuário deletado com sucesso" };
  }
}

export { DeleteUserService };

