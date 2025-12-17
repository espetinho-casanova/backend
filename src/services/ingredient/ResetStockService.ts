import prismaClient from "../../prisma";
import { DEFAULT_STOCK } from "../../utils/constants";

class ResetStockService {
    async execute() {
        // Reseta o estoque de todos os produtos para o valor padrão
        const productsResult = await prismaClient.product.updateMany({
            data: {
                stock: DEFAULT_STOCK,
            },
        });

        // Reabilita todos os produtos que estavam desabilitados por falta de estoque
        const enabledProducts = await prismaClient.product.updateMany({
            where: {
                available: false,
            },
            data: {
                available: true,
            },
        });

        return {
            message: `Estoque de ${productsResult.count} produto(s) resetado para ${DEFAULT_STOCK}`,
            productsCount: productsResult.count,
            enabledProductsCount: enabledProducts.count,
        };
    }
}

export { ResetStockService };

