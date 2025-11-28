import { Request, Response } from "express";
import ArticleService from "../services/Article";
import { Prisma } from "@prisma/client";
import { processArgs } from "../utils/processArgs";
import OrderService from "../services/Order";
import OrderItemsService from "../services/OrderItems";

export default class OrderItemsController {
  private orderItemsService: OrderItemsService;

  constructor() {
    this.orderItemsService = new OrderItemsService();
  }

  createOrderItems = async (req: Request, res: Response) => {
    const orderItems = await this.orderItemsService.createOrderItems(req.body);
    return res
      .status(201)
      .json({ message: "Order items created successfully", orderItems });
  };

  deleteOrderItems = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order items id is required" });
    }
    const orderItems = await this.orderItemsService.deleteOrderItems(id);
    return res
      .status(201)
      .json({ message: "Order items deleted successfully", orderItems });
  };

  updateOrderItems = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Order id is required" });
    }
    const orderItems = await this.orderItemsService.updateOrderItems(
      id,
      req.body
    );
    return res
      .status(201)
      .json({ message: "Order items updated successfully", orderItems });
  };

  getOrderItems = async (req: Request, res: Response) => {
    const queryParse = req.query;
    const args = processArgs(queryParse);
    const queryArgs: Prisma.OrderItemsFindManyArgs = {
      where: args?.where as Prisma.OrderItemsWhereInput,
      orderBy: args?.orderBy as Prisma.OrderItemsOrderByWithRelationInput,
      include: {
        order: true,
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

    const orderItems = await this.orderItemsService.getOrderItems(queryArgs);

    return res.status(201).json({
      paginatedResult: orderItems.paginatedResult,
      totalCount: orderItems.totalCount,
    });
  };
}
