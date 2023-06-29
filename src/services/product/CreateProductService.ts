import prismaClient from "../../prisma";

interface ProductRequest {
  name: string;
  price: number;
  description: string;
  banner: string;
  categoryId: string;
}

class CreateProductService {
  async execute({
    name,
    price,
    description,
    banner,
    categoryId,
  }: ProductRequest) {
    const product = await prismaClient.product.create({
      data: {
        name: name,
        price: price,
        description: description,
        banner: banner,
        categoryId: categoryId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        banner: true,
        available: true,
        categoryId: true,
      },
    });

    return product;
  }
}

export { CreateProductService };
