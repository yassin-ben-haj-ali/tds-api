import { Router } from "express";
import catchMiddleware from "../middlewares/api";
import AuthController from "../controllers/auth";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", catchMiddleware(authController.login));

export default authRouter;
