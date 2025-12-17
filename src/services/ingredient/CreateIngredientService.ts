import prismaClient from "../../prisma";

interface CreateIngredientRequest {
  name: string;
  image?: string;
  nonRemovable?: boolean; // Se o ingrediente NÃO pode ser removido (padrão: false = removível)
}

class CreateIngredientService {
  async execute({
    name,
    image,
    nonRemovable = false, // Padrão: removível
  }: CreateIngredientRequest) {
    // Verifica se já existe um ingrediente com o mesmo nome
    const ingredientExists = await prismaClient.ingredient.findFirst({
      where: {
        name: name,
      },
    });

    if (ingredientExists) {
      throw new Error("Ingrediente com este nome já existe!");
    }

    const ingredient = await prismaClient.ingredient.create({
      data: {
        name: name,
        image: image,
        nonRemovable: nonRemovable,
      },
    });

    return ingredient;
  }
}

export { CreateIngredientService };

