import prismaClient from "../../prisma";

interface UpdateIngredientRequest {
  id: number;
  name: string;
  nonRemovable?: boolean;
}

class UpdateIngredientService {
  async execute({ id, name, nonRemovable }: UpdateIngredientRequest) {
    // Verificar se o ingrediente existe
    const ingredientExists = await prismaClient.ingredient.findUnique({
      where: { id },
    });

    if (!ingredientExists) {
      throw new Error("Ingrediente não encontrado");
    }

    // Verificar se já existe outro ingrediente com o mesmo nome
    const ingredientWithSameName = await prismaClient.ingredient.findFirst({
      where: {
        name: name,
        id: { not: id }, // Excluir o próprio ingrediente da busca
      },
    });

    if (ingredientWithSameName) {
      throw new Error("Ingrediente com este nome já existe!");
    }

    // Atualizar o ingrediente
    const ingredient = await prismaClient.ingredient.update({
      where: { id },
      data: {
        name,
        nonRemovable: nonRemovable !== undefined ? nonRemovable : ingredientExists.nonRemovable,
      },
    });

    return ingredient;
  }
}

export { UpdateIngredientService };

