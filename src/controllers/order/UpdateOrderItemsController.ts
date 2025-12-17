import { Request, Response } from "express";
import { UpdateOrderItemsService } from "../../services/order/UpdateOrderItemsService";
import { updateOrderItemsSchema } from "../../validations/orderValidations";

class UpdateOrderItemsController {
    async handle(req: Request, res: Response) {
        // Validar dados de entrada
        const validatedData = updateOrderItemsSchema.parse(req.body);
        const { orderId, items } = validatedData;

        const updateOrderItemsService = new UpdateOrderItemsService();

        const order = await updateOrderItemsService.execute({
            orderId,
            items,
        });

        return res.json(order);
    }
}

export { UpdateOrderItemsController };

