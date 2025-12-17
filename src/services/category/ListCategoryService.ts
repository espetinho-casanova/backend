import prismaClient from "../../prisma";

class ListCategoryService {
  async execute() {
    const categories = await prismaClient.category.findMany({
      where: {
        parentId: null,
      },
      select: {
        id: true,
        categoryName: true,
        children: {
          select: {
            id: true,
            categoryName: true,
          },
        },
      },
    });

    const sortedCategories = categories.sort((a, b) => {
      const order = ["Espetinhos", "Lanches", "Bebidas"];
      const indexA = order.indexOf(a.categoryName);
      const indexB = order.indexOf(b.categoryName);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.categoryName.localeCompare(b.categoryName);
    });

    return sortedCategories;
  }
}

export { ListCategoryService };
