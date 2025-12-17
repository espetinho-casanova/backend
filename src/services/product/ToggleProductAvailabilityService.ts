import prismaClient from "../../prisma";

interface ToggleAvailabilityRequest {
  id: number;
}

class ToggleProductAvailabilityService {
  async execute({ id }: ToggleAvailabilityRequest) {
    // Verificar se produto existe
    const product = await prismaClient.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // Alternar o status de available
    const updatedProduct = await prismaClient.product.update({
      where: { id },
      data: {
        available: !product.available,
      },
      select: {
        id: true,
        name: true,
        available: true,
        price: true,
        banner: true,
        description: true,
        categoryId: true,
      },
    });

    return updatedProduct;
  }
}

export { ToggleProductAvailabilityService };

