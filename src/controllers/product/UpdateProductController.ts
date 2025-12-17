import { Request, Response } from "express";
import { UpdateProductService } from "../../services/product/UpdateProductService";

class UpdateProductController {
    async handle(req: Request, res: Response) {
        const { id } = req.params;
        const { name, price, description, categoryId, ingredientIds, addonIds, canBeUsedInSandwich, hasMeatPoint } =
            req.body;

        try {
            // Validações básicas
            if (!name || !price || !categoryId) {
                return res.status(400).json({
                    error: "Campos obrigatórios: name, price, categoryId",
                });
            }

            // Parse dos arrays JSON
            let parsedIngredientIds: number[] = [];
            let parsedAddonIds: number[] = [];

            try {
                parsedIngredientIds = ingredientIds
                    ? JSON.parse(ingredientIds).map((id: string | number) =>
                        parseInt(String(id))
                    )
                    : [];
                parsedAddonIds = addonIds
                    ? JSON.parse(addonIds).map((id: string | number) =>
                        parseInt(String(id))
                    )
                    : [];
            } catch (error) {
                return res.status(400).json({
                    error: "Formato inválido para ingredientIds ou addonIds",
                });
            }

            const updateProductService = new UpdateProductService();

            // Se nova imagem foi enviada, usar ela; senão manter a atual
            const banner = req.file ? req.file.filename : undefined;

            // Converte canBeUsedInSandwich de string para boolean (se vier como string)
            const parsedCanBeUsedInSandwich = canBeUsedInSandwich !== undefined 
                ? (canBeUsedInSandwich === "true" || canBeUsedInSandwich === true)
                : undefined;

            // Converte hasMeatPoint de string para boolean
            const parsedHasMeatPoint = hasMeatPoint !== undefined
                ? (hasMeatPoint === "true" || hasMeatPoint === true)
                : undefined;

            const updatedProduct = await updateProductService.execute({
                id: parseInt(id),
                name,
                price: parseFloat(price),
                description: description || undefined,
                categoryId: parseInt(categoryId),
                banner,
                ingredientIds: parsedIngredientIds,
                addonIds: parsedAddonIds,
                canBeUsedInSandwich: parsedCanBeUsedInSandwich,
                hasMeatPoint: parsedHasMeatPoint,
            });

            return res.json(updatedProduct);
        } catch (error: any) {
            // Erro será tratado pelo middleware global de erros
            throw error;
        }
    }
}

export { UpdateProductController };

