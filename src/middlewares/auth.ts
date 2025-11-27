import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { NextFunction, Request, Response } from "express";
import prisma from "../config/database";
import redisClient from "../config/redis";

export type JWTPayload = {
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

export type TokenData = {
  expAt: number;
  revockedAt?: number | null;
  type: string;
};

export interface RequestUser extends Request {
  user?: User;
}

export const authenticate = async (
  req: RequestUser,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No session" });
  }
  token = token.slice(7, token.length);
  try {
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

    const tokensMap: Map<string, TokenData> = new Map(
      Object.entries(JSON.parse(userTokens))
    );

    const tokenData = tokensMap.get(jti);

    if (!tokenData) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if token has been revoked
    if (tokenData.revockedAt) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    // Check if token has expired
    if (tokenData.expAt !== -1 && tokenData.expAt < Date.now()) {
      return res.status(401).json({ message: "Token has expired" });
    }

    req.user = {
      id: user.id,
      email: user.mailAdress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return next();
  } catch (err) {
    logger.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
