import { Router } from "express";
import catchMiddleware from "../middlewares/api";
import AuthController from "../controllers/auth";
import validateMiddleware from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";

const authRouter = Router();
const authController = new AuthController();

authRouter.post(
  "/login",
  validateMiddleware("login"),
  catchMiddleware(authController.login)
);
authRouter.get("/me", authenticate, catchMiddleware(authController.active));
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get("/refresh", catchMiddleware(authController.refresh));

export default authRouter;
