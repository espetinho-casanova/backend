import { Request, Response } from "express";
import { UpdateProductStockService } from "../../services/product/UpdateProductStockService";

class UpdateProductStockController {
    async handle(req: Request, res: Response) {
        const { id } = req.params;
        const { stock } = req.body;

        try {
            if (stock === undefined || stock === null) {
                return res.status(400).json({
                    error: "Campo 'stock' é obrigatório",
                });
            }

            const updateStockService = new UpdateProductStockService();

            const updatedProduct = await updateStockService.execute({
                id: Number.parseInt(id, 10),
                stock: Number.parseInt(String(stock), 10),
            });

            return res.json(updatedProduct);
        } catch (error: any) {
            // Erro será tratado pelo middleware global de erros
            throw error;
        }
    }
}

export { UpdateProductStockController };

