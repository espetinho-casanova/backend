import { Request, Response } from "express";
import { ResetStockService } from "../../services/ingredient/ResetStockService";

class ResetStockController {
    async handle(req: Request, res: Response) {
        try {
            const resetStockService = new ResetStockService();

            const result = await resetStockService.execute();

            return res.json(result);
        } catch (error: any) {
            // Erro será tratado pelo middleware global de erros
            throw error;
        }
    }
}

export { ResetStockController };

