import prismaClient from "../../prisma";

interface DeleteAddonRequest {
  id: number;
}

class DeleteAddonService {
  async execute({ id }: DeleteAddonRequest) {
    // Verifica se o adicional existe
    const addon = await prismaClient.addon.findUnique({
      where: {
        id: id,
      },
    });

    if (!addon) {
      throw new Error("Adicional não encontrado!");
    }

    // Deleta o adicional (cascade vai deletar os relacionamentos)
    await prismaClient.addon.delete({
      where: {
        id: id,
      },
    });

    return { message: "Adicional deletado com sucesso!" };
  }
}

export { DeleteAddonService };

