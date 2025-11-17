import bcrypt from "bcryptjs";
import { AlreadyExistsError } from "../utils/appErrors";
import { createUserCredentials } from "../validations/user";
import prisma from "../config/database";
import redisClient from "../config/redis";

export default class UserService {
  createUser = async (data: createUserCredentials) => {
    const { name, email, password, phone } = data;
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new AlreadyExistsError("User already exists");
    }
    const hashedPassword = bcrypt.hashSync(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });
    await redisClient.set(`tokens:${newUser.id}`, JSON.stringify(new Map()));

    return newUser;
  };
}
