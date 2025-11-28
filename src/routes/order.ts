import { Router } from "express";

import catchMiddleware from "../middlewares/api";
import validateMiddleware from "../middlewares/validate";
import OrderController from "../controllers/order";

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.post(
  "/",
  validateMiddleware("createOrder"),
  catchMiddleware(orderController.createOrder)
);
orderRouter.get("/", catchMiddleware(orderController.getOrders));

orderRouter.patch("/:id", catchMiddleware(orderController.updateOrder));
orderRouter.delete("/:id", catchMiddleware(orderController.deleteOrder));

export default orderRouter;
