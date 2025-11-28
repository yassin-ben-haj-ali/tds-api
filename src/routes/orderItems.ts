import { Router } from "express";

import catchMiddleware from "../middlewares/api";
import validateMiddleware from "../middlewares/validate";
import OrderItemsController from "../controllers/orderItems";

const orderItemsRouter = Router();
const orderItemsController = new OrderItemsController();

orderItemsRouter.post(
  "/",
  validateMiddleware("createOrderItems"),
  catchMiddleware(orderItemsController.createOrderItems)
);
orderItemsRouter.get("/", catchMiddleware(orderItemsController.getOrderItems));

orderItemsRouter.patch(
  "/:id",
  catchMiddleware(orderItemsController.updateOrderItems)
);
orderItemsRouter.delete(
  "/:id",
  catchMiddleware(orderItemsController.deleteOrderItems)
);

export default orderItemsRouter;
