import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import AuthService from "../services/auth";
import { JWTPayload, RequestUser } from "../middlewares/auth";

export default class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response) => {
    const { mailAdress, password } = req.body;
    const { userExists, accessToken, refreshToken } =
      await this.authService.login({
        mailAdress,
        password,
      });
    return res
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "User logged in successfully",
        user: userExists,
        token: accessToken,
      });
  };

  active = async (req: RequestUser, res: Response) => {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: "No user id found" });

    const user = await this.authService.active(id);
    return res.status(201).json({ message: "User details", user });
  };

  logout = async (req: RequestUser, res: Response) => {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: "No session found" });

    const { sub, jti } = jwt.verify(
      token,
      process.env.TOKEN_PASSWORD as string
    ) as JWTPayload;

    await this.authService.logout(sub, jti);
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const { accessToken, user } = await this.authService.refreshToken(
      refreshToken
    );
    return res
      .status(200)
      .json({ message: "Access token refreshed", token: accessToken, user });
  };

  verify = async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Verification token required" });
    }
    await this.authService.verifyEmailToken(token);
    return res.status(200).json({ message: "Email verified successfully" });
  };
}
