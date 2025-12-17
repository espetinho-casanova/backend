import prismaClient from "../../prisma";

interface UpdateCategoryRequest {
  id: number;
  name: string;
}

class UpdateCategoryService {
  async execute({ id, name }: UpdateCategoryRequest) {
    // Verificar se a categoria existe
    const categoryExists = await prismaClient.category.findUnique({
      where: { id },
    });

    if (!categoryExists) {
      throw new Error("Categoria não encontrada");
    }

    // Verificar se já existe outra categoria com o mesmo nome
    const categoryWithSameName = await prismaClient.category.findFirst({
      where: {
        categoryName: name,
        id: { not: id }, // Excluir a própria categoria da busca
      },
    });

    if (categoryWithSameName) {
      throw new Error("Categoria com este nome já existe!");
    }

    // Atualizar a categoria
    const category = await prismaClient.category.update({
      where: { id },
      data: {
        categoryName: name,
      },
      select: {
        id: true,
        categoryName: true,
      },
    });

    return category;
  }
}

export { UpdateCategoryService };

