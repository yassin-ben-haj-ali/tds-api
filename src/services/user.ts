import bcrypt from "bcryptjs";
import { AlreadyExistsError } from "../utils/appErrors";
import { createUserCredentials } from "../validations/user";
import prisma from "../config/database";
import redisClient from "../config/redis";
import { Role } from "@prisma/client";

export default class UserService {
  createUser = async (data: createUserCredentials) => {
    const { firstName, lastName, mailAdress, password, phone, role } = data;
    const userExists = await prisma.user.findUnique({
      where: { mailAdress },
    });
    if (userExists) {
      throw new AlreadyExistsError("User already exists");
    }
    const hashedPassword = bcrypt.hashSync(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        mailAdress,
        password: hashedPassword,
        phone,
        role: role as Role,
      },
    });
    await redisClient.set(`tokens:${newUser.id}`, JSON.stringify(new Map()));

    return newUser;
  };
}
