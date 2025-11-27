import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { processArgs } from "../utils/processArgs";
import FabriquantService from "../services/Fabriquant";

export default class FabriquantController {
  private fabriquantService: FabriquantService;

  constructor() {
    this.fabriquantService = new FabriquantService();
  }

  createFabriquant = async (req: Request, res: Response) => {
    const fabriquant = await this.fabriquantService.createFabriquant(req.body);
    return res
      .status(201)
      .json({ message: "Fabriquant created successfully", fabriquant });
  };

  deleteFabriquant = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Fabriquant id is required" });
    }
    const fabriquant = await this.fabriquantService.deleteFabriquant(id);
    return res
      .status(201)
      .json({ message: "Fabriquant deleted successfully", fabriquant });
  };

  updateFabriquant = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Fabriquant id is required" });
    }
    const fabriquant = await this.fabriquantService.updateFabriquant(
      id,
      req.body
    );
    return res
      .status(201)
      .json({ message: "Fabriquant updated successfully", fabriquant });
  };

  getFabriquants = async (req: Request, res: Response) => {
    const queryParse = req.query;
    const args = processArgs(queryParse);
    const queryArgs: Prisma.FabriquantFindManyArgs = {
      where: args?.where as Prisma.FabriquantWhereInput,
      orderBy: args?.orderBy as Prisma.FabriquantOrderByWithRelationInput,
    };

    // Add skip only if defined
    if (args.skip !== undefined) {
      queryArgs.skip = parseInt(args.skip);
    }

    // Add take only if defined
    if (args.take !== undefined) {
      queryArgs.take = parseInt(args.take);
    }

    const fabriquants = await this.fabriquantService.getFabriquants(queryArgs);

    return res.status(201).json({
      paginatedResult: fabriquants.paginatedResult,
      totalCount: fabriquants.totalCount,
    });
  };
}
