import { Request, Response } from "express";
import ArticleService from "../services/Article";
import { Prisma } from "@prisma/client";
import { processArgs } from "../utils/processArgs";
import OrderService from "../services/Order";

export default class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = async (req: Request, res: Response) => {
    const order = await this.orderService.createOrder(req.body);
    return res
      .status(201)
      .json({ message: "Order created successfully", order });
  };

  deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order id is required" });
    }
    const order = await this.orderService.deleteOrder(id);
    return res
      .status(201)
      .json({ message: "Order deleted successfully", order });
  };

  updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order id is required" });
    }
    const order = await this.orderService.updateOrder(id, req.body);
    return res
      .status(201)
      .json({ message: "Order updated successfully", order });
  };

  getOrders = async (req: Request, res: Response) => {
    const queryParse = req.query;
    const args = processArgs(queryParse);
    const queryArgs: Prisma.OrderFindManyArgs = {
      where: args?.where as Prisma.OrderWhereInput,
      orderBy: args?.orderBy as Prisma.OrderOrderByWithRelationInput,
      include: {
        fabriquant: true,
        technicien: true,
        article:true
      },
    };

    // Add skip only if defined
    if (args.skip !== undefined) {
      queryArgs.skip = parseInt(args.skip);
    }

    // Add take only if defined
    if (args.take !== undefined) {
      queryArgs.take = parseInt(args.take);
    }

    const orders = await this.orderService.getOrders(queryArgs);

    return res.status(201).json({
      paginatedResult: orders.paginatedResult,
      totalCount: orders.totalCount,
    });
  };
}
