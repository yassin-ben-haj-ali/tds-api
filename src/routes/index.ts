import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import articleRouter from "./article";
import fabriquantRouter from "./fabriquant";
import orderRouter from "./order";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/article", articleRouter);
router.use("/fabriquant", fabriquantRouter);
router.use("/order", orderRouter);

export default router;
