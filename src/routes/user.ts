import { Router } from "express";

import catchMiddleware from "../middlewares/api";
import validateMiddleware from "../middlewares/validate";
import UserController from "../controllers/user";

const userRouter = Router();
const userController = new UserController();

userRouter.post(
  "/",
  validateMiddleware("createUser"),
  catchMiddleware(userController.createUser)
);

userRouter.get("/", catchMiddleware(userController.getUsers));

userRouter.patch("/:id", catchMiddleware(userController.updateUser));
userRouter.delete("/:id", catchMiddleware(userController.deleteUser));

export default userRouter;
