import { Request, Response } from "express";
import { ListByCategoryService } from "../../services/product/ListByCategoryService";

class ListByCategoryController {
  async handle(req: Request, res: Response) {
    const categoryId = req.query.categoryId as string;
    const onlyUsableInSandwich = req.query.onlyUsableInSandwich === "true";

    const listByCategory = new ListByCategoryService();

    const products = await listByCategory.execute({
      categoryId: parseInt(categoryId, 10),
      onlyUsableInSandwich: onlyUsableInSandwich,
    });

    return res.json(products);
  }
}

export { ListByCategoryController };
