import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import articleRouter from "./article";
import fabriquantRouter from "./fabriquant";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/article", articleRouter);
router.use("/fabriquant", fabriquantRouter);

export default router;
