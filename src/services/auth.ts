import bcrypt from "bcryptjs";
import { NotFoundError } from "../utils/appErrors";
import { LoginCredentials } from "../validations/auth";
import prisma from "../config/database";
import TokenManager from "../utils/token";
import redisClient from "../config/redis";
import jwt from "jsonwebtoken";
import { JWTPayload, TokenData } from "../middlewares/auth";
import EmailService from "./email";

export default class AuthService {
  private emailService: EmailService;
  constructor() {
    this.emailService = new EmailService();
  }
  sendEmailVerification = async (userId: string, email: string) => {
    const userExist = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExist) {
      throw new NotFoundError("User not found");
    }

    const tokens = await redisClient.get(`tokens:${userId}`);
    if (!tokens) {
      throw new NotFoundError("No session found");
    }

    const tokensMap = new Map<string, TokenData>(
      Object.entries(JSON.parse(tokens))
    );
    const tokenManager = new TokenManager({ tokensMap: tokensMap });

    tokenManager.createToken({
      userId: userExist.id,
      role: "USER",
      type: "EMAIL_VERIFICATION",
      expiresIn: "1d",
    });

    const emailToken = tokenManager.getByType("EMAIL_VERIFICATION");

    if (!emailToken) {
      throw new Error("Failed to generate email verification token");
    }

    const { token } = emailToken;

    // Save token to Redis
    await redisClient.set(
      `tokens:${userId}`,
      JSON.stringify(Object.fromEntries(tokenManager.tokensMap))
    );

    await this.emailService.sendEmailVerification(email, token);

    return { message: "Verification email sent successfully" };
  };
  login = async (data: LoginCredentials) => {
    const { mailAdress, password } = data;
    const userExists = await prisma.user.findUnique({
      where: { mailAdress },
    });
    if (!userExists) {
      throw new NotFoundError("User not found");
    }
    userExists;

    if (!userExists.password || !userExists.verified) {
      throw new Error("User not verified");
    }
    const isPasswordValid = bcrypt.compareSync(password, userExists.password);
    if (!isPasswordValid) {
      throw new NotFoundError("Invalid credentials");
    }
    const tokens = await redisClient.get(`tokens:${userExists.id}`);
    const tokensMap = tokens
      ? new Map(Object.entries(JSON.parse(tokens)))
      : new Map();
    const tokenManager = new TokenManager({ tokensMap });
    // Access Token
    tokenManager.createToken({
      userId: userExists.id,
      role: "USER",
      type: "access",
      expiresIn: "3h",
    });
    // Refresh Token
    tokenManager.createToken({
      userId: userExists.id,
      role: "USER",
      type: "refresh",
      expiresIn: "7d",
    });
    const accessToken = tokenManager.getByType("access");
    const refreshToken = tokenManager.getByType("refresh");
    if (!accessToken || !refreshToken) {
      throw new NotFoundError("Token generation error");
    }
    await redisClient.set(
      `tokens:${userExists.id}`,
      JSON.stringify(Object.fromEntries(tokenManager.tokensMap))
    );
    return {
      userExists,
      accessToken: accessToken.token,
      accessExpAt: accessToken.expAt,
      refreshToken: refreshToken.token,
      refreshExpAt: refreshToken.expAt,
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
  logout = async (userId: string, jti: string) => {
    const tokens = await redisClient.get(`tokens:${userId}`);

    if (!tokens) throw new NotFoundError("No active sessions found");

    const tokensMap = new Map(Object.entries(JSON.parse(tokens)));

    const tokenData = tokensMap.get(jti);

    if (!tokenData) throw new NotFoundError("Token not found");

    // Mark token revoked
    tokensMap.set(jti, {
      ...tokenData,
      revockedAt: Date.now(),
    });
    await redisClient.set(
      `tokens:${userId}`,
      JSON.stringify(Object.fromEntries(tokensMap))
    );

    return {
      message: "Logged out successfully",
    };
  };
  refreshToken = async (refreshToken: string) => {
    const { jti, sub, role } = jwt.verify(
      refreshToken,
      process.env.TOKEN_PASSWORD as string
    ) as JWTPayload;

    const userExist = await prisma.user.findUnique({
      where: { id: sub },
    });

    if (!userExist) {
      throw new NotFoundError("User not found");
    }

    // Get user tokens from Redis
    const tokens = await redisClient.get(`tokens:${sub}`);
    if (!tokens) {
      throw new NotFoundError("No session found");
    }
    const tokensMap = new Map<string, TokenData>(
      Object.entries(JSON.parse(tokens))
    );
    const tokenData = tokensMap.get(jti);
    if (!tokenData) {
      throw new NotFoundError("Refresh token not found");
    }
    // Check if revoked/expired
    if (tokenData.revockedAt) {
      throw new NotFoundError("Refresh token revoked");
    }
    if (tokenData.expAt !== -1 && tokenData.expAt < Date.now()) {
      throw new NotFoundError("Refresh token expired");
    }

    const tokenManager = new TokenManager({ tokensMap });
    tokenManager.createToken({
      userId: sub,
      role: role,
      type: "access",
      expiresIn: "3h",
    });
    const accessToken = tokenManager.getByType("access");
    if (!accessToken) {
      throw new NotFoundError("Could not create access token");
    }
    await redisClient.set(
      `tokens:${sub}`,
      JSON.stringify(Object.fromEntries(tokenManager.tokensMap))
    );
    return {
      accessToken: accessToken.token,
      user: userExist,
    };
  };
  verifyEmailToken = async (emailToken: string) => {
    const { jti, sub } = jwt.verify(
      emailToken,
      process.env.TOKEN_PASSWORD as string
    ) as JWTPayload;

    const userExist = await prisma.user.findUnique({
      where: { id: sub },
    });
    if (!userExist) {
      throw new NotFoundError("User not found");
    }
    const tokens = await redisClient.get(`tokens:${sub}`);
    if (!tokens) throw new NotFoundError("No session found");
    const tokensMap = new Map<string, TokenData>(
      Object.entries(JSON.parse(tokens))
    );
    const tokenData = tokensMap.get(jti);
    if (!tokenData || tokenData.type !== "EMAIL_VERIFICATION") {
      throw new NotFoundError("Verification token invalid");
    }
    if (tokenData.revockedAt) {
      throw new NotFoundError("Verification token revoked");
    }
    if (tokenData.expAt !== -1 && tokenData.expAt < Date.now()) {
      throw new NotFoundError("Verification token expired");
    }
    await prisma.user.update({
      where: { id: sub },
      data: { verified: true },
    });

    await redisClient.set(
      `tokens:${sub}`,
      JSON.stringify(Object.fromEntries(tokensMap))
    );
    return {
      token: emailToken,
    };
  };
  resetPasswordWithToken = async (token: string, password: string) => {
    const { jti, sub } = jwt.verify(
      token,
      process.env.TOKEN_PASSWORD as string
    ) as JWTPayload;

    const userExist = await prisma.user.findUnique({
      where: { id: sub },
    });
    if (!userExist) {
      throw new NotFoundError("User not found");
    }
    if (!userExist.verified) {
      throw new NotFoundError("User not verified");
    }
    if (userExist.password) {
      throw new NotFoundError("Password already set");
    }

    // Get tokens from Redis
    const tokens = await redisClient.get(`tokens:${sub}`);
    if (!tokens) throw new NotFoundError("No session found");
    const tokensMap = new Map<string, TokenData>(
      Object.entries(JSON.parse(tokens))
    );
    const tokenData = tokensMap.get(jti);
    if (!tokenData || tokenData.type !== "EMAIL_VERIFICATION") {
      throw new NotFoundError("Token invalid");
    }
    if (tokenData.revockedAt) {
      throw new NotFoundError("Token revoked");
    }
    if (tokenData.expAt !== -1 && tokenData.expAt < Date.now()) {
      throw new NotFoundError("Token expired");
    }

    const hashedPassword = bcrypt.hashSync(
      password,
      Number(process.env.SALT_ROUNDS || 10)
    );
    await prisma.user.update({
      where: { id: sub },
      data: { password: hashedPassword },
    });

    // Revoke the token
    tokensMap.set(jti, { ...tokenData, revockedAt: Date.now() });
    await redisClient.set(
      `tokens:${sub}`,
      JSON.stringify(Object.fromEntries(tokensMap))
    );
    return { message: "Password set" };
  };
}
