import prismaClient from "../../prisma";

interface ProductRequest {
  categoryId: string;
}

class ListByCategoryService {
  async execute({ categoryId }: ProductRequest) {
    const findByCategory = await prismaClient.product.findMany({
      where: {
        categoryId: categoryId,
      },
      select: {
        name: true,
        description: true,
        price: true,
        available: true,
        banner: true,
        id: true,
        categoryId: true,
      },
    });

    return findByCategory;
  }
}

export { ListByCategoryService };
