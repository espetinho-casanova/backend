import { Router } from "express";
import multer from "multer";

import { CreateUserController } from "./controllers/user/CreateUserController";
import { AuthUserController } from "./controllers/user/AuthUserController";
import { DetailUserController } from "./controllers/user/DetailUserController";
import { ListUsersController } from "./controllers/user/ListUsersController";
import { UpdateUserController } from "./controllers/user/UpdateUserController";
import { DeleteUserController } from "./controllers/user/DeleteUserController";

import { ListRolesController } from "./controllers/role/ListRolesController";
import { CreateRoleController } from "./controllers/role/CreateRoleController";
import { UpdateRoleController } from "./controllers/role/UpdateRoleController";
import { DeleteRoleController } from "./controllers/role/DeleteRoleController";

import { ListPermissionsController } from "./controllers/permission/ListPermissionsController";

import { CreateCategoryController } from "./controllers/category/CreateCategoryController";
import { ListCategoryController } from "./controllers/category/ListCategoryController";
import { UpdateCategoryController } from "./controllers/category/UpdateCategoryController";

import { CreateProductController } from "./controllers/product/CreateProductController";
import { ListByCategoryController } from "./controllers/product/ListByCategoryController";
import { UpdateProductController } from "./controllers/product/UpdateProductController";
import { ToggleProductAvailabilityController } from "./controllers/product/ToggleProductAvailabilityController";
import { UpdateProductStockController } from "./controllers/product/UpdateProductStockController";

import { CreateIngredientController } from "./controllers/ingredient/CreateIngredientController";
import { ListIngredientController } from "./controllers/ingredient/ListIngredientController";
import { DeleteIngredientController } from "./controllers/ingredient/DeleteIngredientController";
import { UpdateIngredientController } from "./controllers/ingredient/UpdateIngredientController";
import { ResetStockController } from "./controllers/ingredient/ResetStockController";

import { CreateAddonController } from "./controllers/addon/CreateAddonController";
import { ListAddonController } from "./controllers/addon/ListAddonController";
import { DeleteAddonController } from "./controllers/addon/DeleteAddonController";
import { UpdateAddonController } from "./controllers/addon/UpdateAddonController";

import { CreateOrderController } from "./controllers/order/CreateOrderController";
import { AddItemController } from "./controllers/order/AddItemController";
import { RemoveItemController } from "./controllers/order/RemoveItemController";
import { SendOrderController } from "./controllers/order/SendOrderController";
import { ProductsOrderController } from "./controllers/order/ProductsOrderController";
import { ListOrdersController } from "./controllers/order/ListOrdersController";
import { ListFinishedOrdersController } from "./controllers/order/ListFinishedOrdersController";
import { UpdateOrderController } from "./controllers/order/UpdateOrderController";
import { UpdateOrderItemsController } from "./controllers/order/UpdateOrderItemsController";
import { FinishOrderController } from "./controllers/order/FinishOrderController";
import { MarkAsReadyController } from "./controllers/order/MarkAsReadyController";
import { MarkAsInPreparationController } from "./controllers/order/MarkAsInPreparationController";
import { AddItemDetailController } from "./controllers/order/AddItemDetailController";
import { ReorderOrdersController } from "./controllers/order/ReorderOrdersController";
import { ToggleItemTakenToTableController } from "./controllers/order/ToggleItemTakenToTableController";
import { ReturnToReadyController } from "./controllers/order/ReturnToReadyController";
import { OrdersSSEController } from "./controllers/order/OrdersSSEController";

import { CreateWaitingQueueController } from "./controllers/waitingQueue/CreateWaitingQueueController";
import { ListWaitingQueueController } from "./controllers/waitingQueue/ListWaitingQueueController";
import { DeleteWaitingQueueController } from "./controllers/waitingQueue/DeleteWaitingQueueController";

import { isAuthenticated } from "./middlewares/isAuthenticated";
import { hasPermission } from "./middlewares/hasPermission";

import uploadConfig from "./config/multer";

const router = Router();

const upload = multer(uploadConfig.upload("./tmp"));

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.post("/session", new AuthUserController().handle);
router.get("/userinfo", isAuthenticated, new DetailUserController().handle);

router.get("/users", isAuthenticated, hasPermission("user.view"), new ListUsersController().handle);
router.post("/users", isAuthenticated, hasPermission("user.create"), new CreateUserController().handle);
router.put("/users/:id", isAuthenticated, hasPermission("user.edit"), new UpdateUserController().handle);
router.delete("/users/:id", isAuthenticated, hasPermission("user.delete"), new DeleteUserController().handle);

router.get("/roles", isAuthenticated, hasPermission("role.view"), new ListRolesController().handle);
router.post("/roles", isAuthenticated, hasPermission("role.create"), new CreateRoleController().handle);
router.put("/roles/:id", isAuthenticated, hasPermission("role.edit"), new UpdateRoleController().handle);
router.delete("/roles/:id", isAuthenticated, hasPermission("role.delete"), new DeleteRoleController().handle);

router.get("/permissions", isAuthenticated, hasPermission("role.view"), new ListPermissionsController().handle);
router.post(
  "/category",
  isAuthenticated,
  hasPermission("category.create"),
  new CreateCategoryController().handle
);

router.get("/categories", isAuthenticated, hasPermission("category.view"), new ListCategoryController().handle);

router.put(
  "/category/:id",
  isAuthenticated,
  hasPermission("category.edit"),
  new UpdateCategoryController().handle
);

router.post(
  "/product",
  isAuthenticated,
  hasPermission("product.create"),
  upload.single("file"),
  new CreateProductController().handle
);

router.get(
  "/category/product",
  isAuthenticated,
  hasPermission("product.view"),
  new ListByCategoryController().handle
);

router.put(
  "/product/:id",
  isAuthenticated,
  hasPermission("product.edit"),
  upload.single("file"),
  new UpdateProductController().handle
);

router.patch(
  "/product/:id/toggle-availability",
  isAuthenticated,
  hasPermission("product.toggle_availability"),
  new ToggleProductAvailabilityController().handle
);

router.put(
  "/product/:id/stock",
  isAuthenticated,
  hasPermission("product.update_stock"),
  new UpdateProductStockController().handle
);

router.post(
  "/ingredient",
  isAuthenticated,
  hasPermission("ingredient.create"),
  new CreateIngredientController().handle
);

router.get(
  "/ingredients",
  isAuthenticated,
  hasPermission("ingredient.view"),
  new ListIngredientController().handle
);

router.put(
  "/ingredient/:id",
  isAuthenticated,
  hasPermission("ingredient.edit"),
  new UpdateIngredientController().handle
);

router.delete(
  "/ingredient/:id",
  isAuthenticated,
  hasPermission("ingredient.delete"),
  new DeleteIngredientController().handle
);

router.post(
  "/products/reset-stock",
  isAuthenticated,
  hasPermission("product.update_stock"),
  new ResetStockController().handle
);

router.post(
  "/addon",
  isAuthenticated,
  hasPermission("addon.create"),
  new CreateAddonController().handle
);

router.get(
  "/addons",
  isAuthenticated,
  hasPermission("addon.view"),
  new ListAddonController().handle
);

router.put(
  "/addon/:id",
  isAuthenticated,
  hasPermission("addon.edit"),
  new UpdateAddonController().handle
);

router.delete(
  "/addon/:id",
  isAuthenticated,
  hasPermission("addon.delete"),
  new DeleteAddonController().handle
);

router.post("/order", isAuthenticated, new CreateOrderController().handle);

router.post("/order/add", isAuthenticated, new AddItemController().handle);

router.delete(
  "/order/remove",
  isAuthenticated,
  new RemoveItemController().handle
);

router.put("/order/send", isAuthenticated, new SendOrderController().handle);

router.put("/order/update", isAuthenticated, new UpdateOrderController().handle);

router.put("/order/update-items", isAuthenticated, new UpdateOrderItemsController().handle);

router.put("/order/reorder", isAuthenticated, new ReorderOrdersController().handle);

router.get("/orders", isAuthenticated, new ListOrdersController().handle);

router.get("/orders/events", isAuthenticated, new OrdersSSEController().handle);

router.get("/orders/finished", isAuthenticated, new ListFinishedOrdersController().handle);

router.get(
  "/order/detail",
  isAuthenticated,
  new ProductsOrderController().handle
);

router.put(
  "/order/ready",
  isAuthenticated,
  new MarkAsReadyController().handle
);

router.put(
  "/order/in-preparation",
  isAuthenticated,
  new MarkAsInPreparationController().handle
);

router.put(
  "/order/finish",
  isAuthenticated,
  new FinishOrderController().handle
);

router.put(
  "/order/return-to-ready",
  isAuthenticated,
  new ReturnToReadyController().handle
);

router.post(
  "/order/addItemDetail",
  isAuthenticated,
  new AddItemDetailController().handle
);

router.put(
  "/order/item/toggle-taken",
  isAuthenticated,
  new ToggleItemTakenToTableController().handle
);

router.post(
  "/waiting-queue",
  isAuthenticated,
  new CreateWaitingQueueController().handle
);

router.get(
  "/waiting-queue",
  isAuthenticated,
  new ListWaitingQueueController().handle
);

router.delete(
  "/waiting-queue/:id",
  isAuthenticated,
  new DeleteWaitingQueueController().handle
);

export { router };
