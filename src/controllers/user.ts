import { Request, Response } from "express";
import UserService from "../services/user";

export default class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response) => {
    const {
      firstName,
      mailAdress,
      lastName,
      password,
      phone,
      confirmPassword,
      role,
    } = req.body;
    const user = await this.userService.createUser({
      firstName,
      mailAdress,
      lastName,
      password,
      phone,
      confirmPassword,
      role,
    });
    return res.status(201).json({ message: "User created successfully", user });
  };
}
