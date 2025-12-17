import prismaClient from "../../prisma";

interface DeleteIngredientRequest {
  id: number;
}

class DeleteIngredientService {
  async execute({ id }: DeleteIngredientRequest) {
    // Verifica se o ingrediente existe
    const ingredient = await prismaClient.ingredient.findUnique({
      where: {
        id: id,
      },
    });

    if (!ingredient) {
      throw new Error("Ingrediente não encontrado!");
    }

    // Deleta o ingrediente (cascade vai deletar os relacionamentos)
    await prismaClient.ingredient.delete({
      where: {
        id: id,
      },
    });

    return { message: "Ingrediente deletado com sucesso!" };
  }
}

export { DeleteIngredientService };

