import prismaClient from "../../prisma";

interface ProductRequest {
  name: string;
  price: number;
  description?: string;
  banner?: string;
  categoryId: number;
  ingredientIds?: number[]; // IDs dos ingredientes que compõem o produto
  addonIds?: number[]; // IDs dos adicionais permitidos para este produto
  canBeUsedInSandwich?: boolean; // Se o espetinho pode ser usado no lanche (Xis/Ká)
  hasMeatPoint?: boolean; // Se o produto tem ponto da carne (espetinhos de carne)
}

class CreateProductService {
  async execute({
    name,
    price,
    description,
    banner,
    categoryId,
    ingredientIds = [],
    addonIds = [],
    canBeUsedInSandwich = true,
    hasMeatPoint = true,
  }: ProductRequest) {
    // Cria o produto com os relacionamentos usando Nested Writes
    const product = await prismaClient.product.create({
      data: {
        name: name,
        price: price,
        description: description,
        banner: banner,
        categoryId: categoryId,
        canBeUsedInSandwich: canBeUsedInSandwich,
        hasMeatPoint: hasMeatPoint,
        // Conecta os ingredientes selecionados (tabela pivô ProductIngredient)
        ingredients: {
          create: ingredientIds.map((ingredientId) => ({
            ingredientId: ingredientId,
          })),
        },
        // Conecta os adicionais permitidos (tabela pivô ProductAddon)
        addons: {
          create: addonIds.map((addonId) => ({
            addonId: addonId,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        addons: {
          include: {
            addon: true,
          },
        },
      },
    });

    return product;
  }
}

export { CreateProductService };
