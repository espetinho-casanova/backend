import prismaClient from "../../prisma";
import fs from "fs";
import path from "path";

interface UpdateProductRequest {
    id: number;
    name: string;
    price: number;
    description?: string;
    categoryId: number;
    banner?: string;
    ingredientIds?: number[];
    addonIds?: number[];
    canBeUsedInSandwich?: boolean;
    hasMeatPoint?: boolean;
}

class UpdateProductService {
    async execute({
        id,
        name,
        price,
        description,
        categoryId,
        banner,
        ingredientIds = [],
        addonIds = [],
        canBeUsedInSandwich,
        hasMeatPoint,
    }: UpdateProductRequest) {
        // 1. Verificar se produto existe
        const productExists = await prismaClient.product.findUnique({
            where: { id: parseInt(String(id)) },
        });

        if (!productExists) {
            throw new Error("Produto não encontrado");
        }

        // 2. Verificar se categoria existe
        const categoryExists = await prismaClient.category.findUnique({
            where: { id: categoryId },
        });

        if (!categoryExists) {
            throw new Error("Categoria não encontrada");
        }

        // 3. Validar ingredientes (se fornecidos)
        if (ingredientIds.length > 0) {
            const validIngredients = await prismaClient.ingredient.findMany({
                where: { id: { in: ingredientIds } },
            });

            if (validIngredients.length !== ingredientIds.length) {
                throw new Error("Um ou mais ingredientes são inválidos");
            }
        }

        // 4. Validar adicionais (se fornecidos)
        if (addonIds.length > 0) {
            const validAddons = await prismaClient.addon.findMany({
                where: { id: { in: addonIds } },
            });

            if (validAddons.length !== addonIds.length) {
                throw new Error("Um ou mais adicionais são inválidos");
            }
        }

        // 5. Se nova imagem foi fornecida, deletar a antiga
        let finalBanner = productExists.banner;

        if (banner && banner !== productExists.banner) {
            // Deletar imagem antiga se existir
            if (productExists.banner) {
                const oldImagePath = path.resolve(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "tmp",
                    productExists.banner
                );
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (error) {
                        // Erro ao deletar imagem antiga - não crítico, continuar
                        // A imagem antiga ficará no servidor mas não será mais referenciada
                    }
                }
            }
            finalBanner = banner;
        }

        // 6. Atualizar dados básicos do produto
        await prismaClient.product.update({
            where: { id: parseInt(String(id)) },
            data: {
                name,
                price: parseFloat(String(price)),
                description: description || null,
                categoryId,
                banner: finalBanner,
                canBeUsedInSandwich: canBeUsedInSandwich !== undefined ? canBeUsedInSandwich : productExists.canBeUsedInSandwich,
                hasMeatPoint: hasMeatPoint !== undefined ? hasMeatPoint : productExists.hasMeatPoint,
            },
        });

        // 7. Atualizar ingredientes (delete + create)
        // Deletar todos os ingredientes atuais
        await prismaClient.productIngredient.deleteMany({
            where: { productId: parseInt(String(id)) },
        });

        // Criar novos relacionamentos
        if (ingredientIds.length > 0) {
            await prismaClient.productIngredient.createMany({
                data: ingredientIds.map((ingredientId) => ({
                    productId: parseInt(String(id)),
                    ingredientId: ingredientId,
                })),
            });
        }

        // 8. Atualizar adicionais (delete + create)
        // Deletar todos os adicionais atuais
        await prismaClient.productAddon.deleteMany({
            where: { productId: parseInt(String(id)) },
        });

        // Criar novos relacionamentos
        if (addonIds.length > 0) {
            await prismaClient.productAddon.createMany({
                data: addonIds.map((addonId) => ({
                    productId: parseInt(String(id)),
                    addonId: addonId,
                })),
            });
        }

        // 9. Buscar e retornar produto atualizado
        const updatedProduct = await prismaClient.product.findUnique({
            where: { id: parseInt(String(id)) },
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
                                nonRemovable: true, // Campo necessário para filtrar ingredientes removíveis
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

        // Formatar resposta
        return {
            id: updatedProduct!.id,
            name: updatedProduct!.name,
            description: updatedProduct!.description,
            price: updatedProduct!.price,
            banner: updatedProduct!.banner,
            available: updatedProduct!.available,
            categoryId: updatedProduct!.categoryId,
            category: updatedProduct!.category,
            canBeUsedInSandwich: updatedProduct!.canBeUsedInSandwich, // Se o espetinho pode ser usado no lanche (Xis/Ká)
            hasMeatPoint: updatedProduct!.hasMeatPoint, // Se o produto tem ponto da carne
            ingredients: updatedProduct!.ingredients.map((pi) => ({
                id: pi.ingredient.id,
                name: pi.ingredient.name,
                image: pi.ingredient.image,
                nonRemovable: pi.ingredient.nonRemovable, // Se NÃO pode ser removido
            })),
            addons: updatedProduct!.addons.map((pa) => ({
                id: pa.addon.id,
                name: pa.addon.name,
                price: pa.addon.price,
                image: pa.addon.image,
            })),
        };
    }
}

export { UpdateProductService };

