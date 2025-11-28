import { Request, Response } from "express";
import UserService from "../services/user";
import { processArgs } from "../utils/processArgs";
import { Prisma } from "@prisma/client";

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
      telephoneNumber,
      countryCode,
      role,
    } = req.body;
    const user = await this.userService.createUser({
      firstName,
      mailAdress,
      lastName,
      telephoneNumber,
      countryCode,
      role,
    });
    return res.status(201).json({ message: "User created successfully", user });
  };
  deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User id is required" });
    }
    const user = await this.userService.deleteUser(id);
    return res.status(201).json({ message: "User deleted successfully", user });
  };

  updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order id is required" });
    }
    const user = await this.userService.updateUser(id, req.body);
    return res.status(201).json({ message: "User updated successfully", user });
  };

  getUsers = async (req: Request, res: Response) => {
    const queryParse = req.query;
    const args = processArgs(queryParse);
    const queryArgs: Prisma.UserFindManyArgs = {
      where: args?.where as Prisma.UserWhereInput,
      orderBy: args?.orderBy as Prisma.UserOrderByWithRelationInput,
    };

    // Add skip only if defined
    if (args.skip !== undefined) {
      queryArgs.skip = parseInt(args.skip);
    }

    // Add take only if defined
    if (args.take !== undefined) {
      queryArgs.take = parseInt(args.take);
    }

    const users = await this.userService.getUsers(queryArgs);

    return res.status(201).json({
      paginatedResult: users.paginatedResult,
      totalCount: users.totalCount,
    });
  };
}
