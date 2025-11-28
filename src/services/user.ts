import { AlreadyExistsError, NotFoundError } from "../utils/appErrors";
import { createUserCredentials } from "../validations/user";
import prisma from "../config/database";
import redisClient from "../config/redis";
import { Prisma, Role, User } from "@prisma/client";
import AuthService from "./auth";
import { PaginatedInterface } from "../utils/type";

export default class UserService {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }
  createUser = async (data: createUserCredentials) => {
    const {
      firstName,
      lastName,
      mailAdress,
      telephoneNumber,
      role,
      countryCode,
    } = data;
    const userExists = await prisma.user.findUnique({
      where: { mailAdress },
    });
    if (userExists) {
      throw new AlreadyExistsError("User already exists");
    }
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        mailAdress,
        telephoneNumber,
        countryCode: countryCode ?? null,
        role: role as Role,
        verified: false,
        password: null,
      },
    });
    await redisClient.set(`tokens:${newUser.id}`, JSON.stringify(new Map()));
    // Send email verification
    const verificationResult = await this.authService.sendEmailVerification(
      newUser.id,
      newUser.mailAdress
    );
    return { user: newUser, verification: verificationResult };
  };
  deleteUser = async (userId: string) => {
    const userExist = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!userExist) throw new NotFoundError("User not found");

    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  };

  updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
    const userExist = await prisma.user.findFirst({
      where: { id },
    });

    if (!userExist) throw new NotFoundError("User not found");

    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  };

  getUsers = async (
    args: Prisma.UserFindManyArgs
  ): Promise<PaginatedInterface<User>> => {
    const [data, totalCount] = await Promise.all([
      prisma.user.findMany(args),
      prisma.user.count({ where: args.where ?? {} }),
    ]);
    return { paginatedResult: data, totalCount };
  };
}
