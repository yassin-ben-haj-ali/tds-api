import { ConflictError, NotFoundError } from "../utils/appErrors";
import prisma from "../config/database";

import { Order, OrderItems, Prisma } from "@prisma/client";
import { PaginatedInterface } from "../utils/type";
import {
  createOrderCredentials,
  createOrderItemsCredentials,
} from "../validations/order";

export default class OrderItemsService {
  createOrderItems = async (data: createOrderItemsCredentials) => {
    const { orderId, quantity } = data;

    const orderExist = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        article: true,
      },
    });
    if (!orderExist) throw new NotFoundError("order not exist");

    const itemsWorked = orderExist.orderItems.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);

    const restForWorking = orderExist.article.quantity - itemsWorked;

    if (quantity > restForWorking) {
      throw new ConflictError(
        `Cannot add ${quantity} items. Only ${restForWorking} remaining.`
      );
    }

    const newOrderItems = await prisma.orderItems.create({
      data,
    });

    await this.updateArticleStatus(orderId);

    return newOrderItems;
  };

  deleteOrderItems = async (orderItemsId: string) => {
    const orderItemsExist = await prisma.orderItems.findFirst({
      where: { id: orderItemsId },
    });

    if (!orderItemsExist) throw new NotFoundError("Order items not found");

    const deletedItem = await prisma.orderItems.delete({
      where: { id: orderItemsId },
    });
    const order = await prisma.order.findUnique({
      where: { id: orderItemsExist.orderId },
      include: { orderItems: true, article: true },
    });

    if (order) {
      const itemsWorked = order.orderItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      if (itemsWorked < order.article.quantity) {
        await prisma.article.update({
          where: { id: order.article.id },
          data: { status: "PENDING" },
        });
      }
    }
    return deletedItem;
  };

  updateOrderItems = async (id: string, data: Prisma.OrderItemsUpdateInput) => {
    const orderItemsExist = await prisma.orderItems.findFirst({
      where: { id },
      include: {
        order: {
          include: {
            article: true,
            orderItems: true,
          },
        },
      },
    });

    if (!orderItemsExist) throw new NotFoundError("Order items not found");

    const itemsWorked = orderItemsExist.order.orderItems.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);

    const restForWorking = orderItemsExist.order.article.quantity - itemsWorked;

    if (
      data.quantity &&
      typeof data.quantity === "number" &&
      data.quantity > restForWorking
    ) {
      throw new ConflictError(
        `Cannot add ${data.quantity} items. Only ${restForWorking} remaining.`
      );
    }
    return prisma.orderItems.update({
      where: {
        id,
      },
      data,
    });
  };

  getOrderItems = async (
    args: Prisma.OrderItemsFindManyArgs
  ): Promise<PaginatedInterface<OrderItems>> => {
    const [data, totalCount] = await Promise.all([
      prisma.orderItems.findMany(args),
      prisma.orderItems.count({ where: args.where ?? {} }),
    ]);
    return { paginatedResult: data, totalCount };
  };

  private async updateArticleStatus(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        article: true,
      },
    });
    if (!order) return;
    const itemsWorked = order.orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    if (itemsWorked >= order.article.quantity) {
      await prisma.article.update({
        where: { id: order.article.id },
        data: { status: "COMPLETED" },
      });
    }
  }
}
