import { NotFoundError } from "../utils/appErrors";
import prisma from "../config/database";

import { Order, Prisma } from "@prisma/client";
import { PaginatedInterface } from "../utils/type";
import { createOrderCredentials } from "../validations/order";

export default class OrderService {
  createOrder = async (data: createOrderCredentials) => {
    const { articleId, fabriquantId } = data;

    const articleExist = await prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!articleExist) throw new NotFoundError("Article not exist");

    const fabriquantExist = await prisma.fabriquant.findUnique({
      where: { id: fabriquantId },
    });
    if (!fabriquantExist) throw new NotFoundError("Fabriquant not exist");

    const newOrder = await prisma.order.create({
      data,
    });

    return newOrder;
  };

  deleteOrder = async (orderId: string) => {
    const orderExist = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!orderExist) throw new NotFoundError("Order not found");

    return prisma.order.delete({
      where: {
        id: orderId,
      },
    });
  };

  updateOrder = async (id: string, data: Prisma.OrderUpdateInput) => {
    const orderExist = await prisma.order.findFirst({
      where: { id },
    });

    if (!orderExist) throw new NotFoundError("Order not found");

    return prisma.order.update({
      where: {
        id,
      },
      data,
    });
  };

  getOrders = async (
    args: Prisma.OrderFindManyArgs
  ): Promise<PaginatedInterface<Order>> => {
    const [data, totalCount] = await Promise.all([
      prisma.order.findMany(args),
      prisma.order.count({ where: args.where ?? {} }),
    ]);
    return { paginatedResult: data, totalCount };
  };
}
