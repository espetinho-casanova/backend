import prismaClient from "../../prisma";

interface ProductRequest {
  categoryId: number;
  onlyUsableInSandwich?: boolean;
}

class ListByCategoryService {
  async execute({ categoryId, onlyUsableInSandwich }: ProductRequest) {
    const category = await prismaClient.category.findUnique({
      where: { id: categoryId },
      include: { children: true },
    });

    const categoryIds = category?.children && category.children.length > 0
      ? category.children.map((child) => child.id)
      : [categoryId];

    const findByCategory = await prismaClient.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        ...(onlyUsableInSandwich && { canBeUsedInSandwich: true }),
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        category: {
          select: {
            categoryName: true,
          },
        },
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                image: true,
                nonRemovable: true,
              },
            },
          },
        },
        addons: {
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const formattedProducts = findByCategory.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      banner: product.banner,
      available: product.available,
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
      canBeUsedInSandwich: product.canBeUsedInSandwich,
      hasMeatPoint: product.hasMeatPoint,
      ingredients: product.ingredients.map((pi) => ({
        id: pi.ingredient.id,
        name: pi.ingredient.name,
        image: pi.ingredient.image,
        nonRemovable: pi.ingredient.nonRemovable,
      })),
      addons: product.addons.map((pa) => ({
        id: pa.addon.id,
        name: pa.addon.name,
        price: pa.addon.price,
        image: pa.addon.image,
      })),
    }));

    return formattedProducts;
  }
}

export { ListByCategoryService };