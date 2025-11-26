import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import articleRouter from "./article";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/article", articleRouter);

export default router;
