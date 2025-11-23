import bcrypt from "bcryptjs";
import { NotFoundError } from "../utils/appErrors";
import { LoginCredentials } from "../validations/auth";
import prisma from "../config/database";
import TokenManager from "../utils/token";
import redisClient from "../config/redis";

export default class AuthService {
  login = async (data: LoginCredentials) => {
    const { mailAdress, password } = data;
    const userExists = await prisma.user.findUnique({
      where: { mailAdress },
    });
    if (!userExists) {
      throw new NotFoundError("User not found");
    }
    const isPasswordValid = bcrypt.compareSync(password, userExists.password);
    if (!isPasswordValid) {
      throw new NotFoundError("Invalid credentials");
    }
    const tokens = await redisClient.get(`tokens:${userExists.id}`);
    const tokensMap = tokens
      ? new Map(Object.entries(JSON.parse(tokens)))
      : new Map();
    const tokenManager = new TokenManager({ tokensMap: tokensMap });
    tokenManager.createToken({
      userId: userExists.id,
      role: "user",
      type: "access",
      expiresIn: "3h",
    });
    const accessToken = tokenManager.getByType("access");
    if (!accessToken) {
      throw new NotFoundError("Access token not found");
    }
    const { token, expAt } = accessToken;
    await redisClient.set(
      `tokens:${userExists.id}`,
      JSON.stringify(Object.fromEntries(tokenManager.tokensMap))
    );
    return {
      userExists,
      token,
      expAt,
    };
  };
  active = async (id: string) => {
    const userExists = await prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) {
      throw new NotFoundError("User not found");
    }
    return userExists;
  };
}
