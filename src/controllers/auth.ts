import { Request, Response } from "express";
import AuthService from "../services/auth";
import { RequestUser } from "../middlewares/auth";

export default class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    const { mailAdress, password } = req.body;
    const { userExists, token, expAt } = await this.authService.login({
      mailAdress,
      password,
    });
    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3 * 60 * 60 * 1000, // 3h in ms
      })
      .status(201)
      .json({ message: "User logged in successfully", user: userExists });
  };

  active = async (req: RequestUser, res: Response) => {
    const { id } = req.user!;
    const user = await this.authService.active(id);
    return res.status(201).json({ message: "User details", user });
  };
}
