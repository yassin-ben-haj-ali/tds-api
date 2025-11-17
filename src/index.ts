import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Request, Response } from "express";
import logger from "./utils/logger";
import { AppError } from "./utils/appErrors";
import router from "./routes";
import prisma from "./config/database";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8800;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.use((err: AppError, req: Request, res: Response) => {
  logger.error(err);
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
