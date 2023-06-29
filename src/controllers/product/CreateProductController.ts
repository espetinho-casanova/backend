import { Request, Response } from "express";
import { CreateProductService } from "../../services/product/CreateProductService";

class CreateProductController {
  async handle(req: Request, res: Response) {
    const { name, price, description, categoryId } = req.body;

    const createProductService = new CreateProductService();

    if (!req.file) {
      throw new Error("Error upload a file!");
    } else {
      const { originalname, filename: banner } = req.file;

      const product = await createProductService.execute({
        name,
        price: parseFloat(price),
        description,
        banner,
        categoryId,
      });

      return res.json(product);
    }
  }
}

export { CreateProductController };
