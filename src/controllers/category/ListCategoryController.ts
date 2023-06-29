import { Request, Response } from "express";
import { ListCategoryService } from "../../services/category/ListCategoryService";

class ListCategoryController {
  async handle(req: Request, res: Response) {
    const listCategoryController = new ListCategoryService();

    const categories = await listCategoryController.execute();

    return res.json(categories);
  }
}

export { ListCategoryController };