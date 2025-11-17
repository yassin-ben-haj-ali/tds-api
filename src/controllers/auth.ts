import { Request, Response } from "express";
import AuthService from "../services/auth";

export default class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await this.authService.login({ email, password });
    return res
      .status(201)
      .json({ message: "User logged in successfully", user });
  };
}
