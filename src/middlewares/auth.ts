import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { NextFunction, Request, Response } from "express";
import prisma from "../config/database";
import redisClient from "../config/redis";

type JWTPayload = {
  sub: string;
  jti: string;
  role?: string;
};

type User = {
  id: string;
  email: string;
  role?: string;
  firstName: string;
  lastName: string;
};

export interface RequestUser extends Request {
  user?: User;
}

export const authenticate = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ message: "No session" });
    }

    const { sub, jti } = jwt.verify(
      token,
      process.env.TOKEN_PASSWORD as string
    ) as JWTPayload;

    const user = await prisma.user.findUnique({ where: { id: sub } });

    if (!user) {
      return res.status(401).json({ message: "No User" });
    }

    const userTokens = await redisClient.get(`tokens:${user.id}`);

    if (!userTokens) {
      return res.status(401).json({ message: "No session" });
    }

    const tokensMap = userTokens
      ? new Map(Object.entries(JSON.parse(userTokens)))
      : new Map();

    if (tokensMap.has(jti)) {
      req.user = {
        id: user.id,
        email: user.mailAdress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      return next();
    }
  } catch (err) {
    logger.error(err);
  }
  return res.status(401).json({ message: "Unauthorized" });
};
