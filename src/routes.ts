import { Router } from "express";
import multer from "multer";

import { CreateUserController } from "./controllers/user/CreateUserController";
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";

import { CreateCategoryController } from "./controllers/category/CreateCategoryController";
import { ListCategoryController } from "./controllers/category/ListCategoryController";

import { CreateProductController } from "./controllers/product/CreateProductController";
import { ListByCategoryController } from "./controllers/product/ListByCategoryController";

import { CreateOrderController } from "./controllers/order/CreateOrderController";
import { AddItemController } from "./controllers/order/AddItemController";
import { RemoveItemController } from "./controllers/order/RemoveItemController";
import { SendOrderController } from "./controllers/order/SendOrderController";
import { ProductsOrderController } from "./controllers/order/ProductsOrderController";
import { ListOrdersController } from "./controllers/order/ListOrdersController";
import { FinishOrderController } from "./controllers/order/FinishOrderController";
import { AddItemDetailController } from "./controllers/order/AddItemDetailController";

import { isAuthenticated } from "./middlewares/isAuthenticated";

import uploadConfig from "./config/multer";

const router = Router();

const upload = multer(uploadConfig.upload("./tmp"));

// -- Rotas User --
router.post("/users", new CreateUserController().handle);

router.post("/session", new AuthUserController().handle);

router.get("/userinfo", isAuthenticated, new DetailUserController().handle);

// -- Rotas Category --
router.post(
  "/category",
  isAuthenticated,
  new CreateCategoryController().handle
);

router.get("/categories", isAuthenticated, new ListCategoryController().handle);

// -- Rotas Product --
router.post(
  "/product",
  isAuthenticated,
  upload.single("file"),
  new CreateProductController().handle
);

router.get(
  "/category/product",
  isAuthenticated,
  new ListByCategoryController().handle
);

// -- Rotas Order --
router.post("/order", isAuthenticated, new CreateOrderController().handle);

router.post("/order/add", isAuthenticated, new AddItemController().handle);

router.delete(
  "/order/remove",
  isAuthenticated,
  new RemoveItemController().handle
);

router.put("/order/send", isAuthenticated, new SendOrderController().handle);

router.get("/orders", isAuthenticated, new ListOrdersController().handle);

router.get(
  "/order/detail",
  isAuthenticated,
  new ProductsOrderController().handle
);

router.put(
  "/order/finish",
  isAuthenticated,
  new FinishOrderController().handle
);

router.post(
  "/order/addItemDetail",
  isAuthenticated,
  new AddItemDetailController().handle
);

export { router };
