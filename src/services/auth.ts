import bcrypt from "bcryptjs";
import { NotFoundError } from "../utils/appErrors";
import { LoginCredentials } from "../validations/auth";
import prisma from "../config/database";
import TokenManager from "../utils/token";
import redisClient from "../config/redis";

export default class AuthService {
  login = async (data: LoginCredentials) => {
    const { email, password } = data;
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (!userExists) {
      throw new NotFoundError("User not found");
    }
    const isPasswordValid = bcrypt.compareSync(password, userExists.password);
    if (!isPasswordValid) {
      throw new NotFoundError("Invalid credentials");
    }
    const tokens = await redisClient.get(`tokens:${userExists.id}`);
    const tokensMap = tokens ? new Map(JSON.parse(tokens)) : new Map();
    const tokenManager = new TokenManager({ tokensMap: tokensMap });
    tokenManager.createToken({
      userId: userExists.id,
      role: "user",
      type: "access",
      expiresIn: "3h",
    });
    await redisClient.set(
      `tokens:${userExists.id}`,
      JSON.stringify(tokenManager.tokensMap)
    );
    return userExists;
  };
}
