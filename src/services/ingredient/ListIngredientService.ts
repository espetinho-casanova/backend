import prismaClient from "../../prisma";

class ListIngredientService {
  async execute() {
    const ingredients = await prismaClient.ingredient.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        image: true,
        nonRemovable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ingredients;
  }
}

export { ListIngredientService };

