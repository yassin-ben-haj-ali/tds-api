import { AlreadyExistsError } from "../utils/appErrors";
import { createUserCredentials } from "../validations/user";
import prisma from "../config/database";
import redisClient from "../config/redis";
import { Role } from "@prisma/client";
import AuthService from "./auth";

export default class UserService {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }
  createUser = async (data: createUserCredentials) => {
    const { firstName, lastName, mailAdress, phone, role } = data;
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
        phone,
        role: role as Role,
        verified: false,
        password: null, 
      },
    });
    await redisClient.set(`tokens:${newUser.id}`, JSON.stringify(new Map()));
    // Send email verification
    const verificationResult = await this.authService.sendEmailVerification(newUser.id, newUser.mailAdress);
    return { user: newUser, verification: verificationResult };
  };
}
