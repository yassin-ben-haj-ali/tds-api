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

export default userRouter;
