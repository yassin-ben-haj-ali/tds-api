import express, { Request, Response, NextFunction } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import { AppError } from "./utils/appErrors";
import router from "./routes";
import prisma from "./config/database";
import redisClient from "./config/redis";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8800;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/v1", router);

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  return err.isOperational
    ? res.status(err.code).json({
        message: err.message,
      })
    : res.status(500).json({
        message: "Internal Server Error",
      });
});
prisma
  .$connect()
  .then(() => {
    logger.info("Connected to MongoDB");
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    prisma.$disconnect();
    logger.error("Error connecting to MongoDB:", error);
  });
