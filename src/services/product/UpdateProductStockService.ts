import prismaClient from "../../prisma";

interface UpdateProductStockRequest {
    id: number;
    stock: number;
}

class UpdateProductStockService {
    async execute({ id, stock }: UpdateProductStockRequest) {
        // Verifica se produto existe
        const product = await prismaClient.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error("Produto não encontrado");
        }

        // Atualiza o estoque
        const updatedProduct = await prismaClient.product.update({
            where: { id },
            data: {
                stock: stock,
                // Se estoque chegou a 0, desabilita o produto
                // Se estoque voltou > 0, reabilita o produto
                available: stock > 0,
            },
        });

        return updatedProduct;
    }
}

export { UpdateProductStockService };

