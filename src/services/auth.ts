import bcrypt from "bcryptjs";
import { NotFoundError } from "../utils/appErrors";
import { LoginCredentials } from "../validations/auth";
import prisma from "../config/database";

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
    return userExists;
  };
}
