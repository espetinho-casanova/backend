import { Request, Response } from "express";
import { ProductsOrderService } from "../../services/order/ProductsOrderService";

class ProductsOrderController {
  async handle(req: Request, res: Response) {
    const orderId = req.query.orderId as string;

    const productsOrderService = new ProductsOrderService();

    const orders = await productsOrderService.execute({
      orderId,
    });

    return res.json(orders);
  }
}

export { ProductsOrderController };
