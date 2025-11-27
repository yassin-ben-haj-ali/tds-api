import { AlreadyExistsError, NotFoundError } from "../utils/appErrors";
import prisma from "../config/database";

import { createArticleCredentials } from "../validations/article";
import { Article, Fabriquant, Prisma } from "@prisma/client";
import { PaginatedInterface } from "../utils/type";
import { createFabriquantCredentials } from "../validations/fabriquant";

export default class FabriquantService {
  createFabriquant = async (data: createFabriquantCredentials) => {
    const { name, mailAdress, countryCode } = data;

    const fabriquantExist = await prisma.fabriquant.findUnique({
      where: { name, mailAdress },
    });
    if (fabriquantExist)
      throw new AlreadyExistsError("Fabriquant already exist");

    const newFabriquant = await prisma.fabriquant.create({
      data: {
        ...data,
        countryCode: countryCode ?? null,
      },
    });

    return newFabriquant;
  };

  deleteFabriquant = async (fabriquantId: string) => {
    const fabriquantExist = await prisma.fabriquant.findFirst({
      where: { id: fabriquantId },
    });

    if (!fabriquantExist) throw new NotFoundError("Fabriquant not found");

    return prisma.fabriquant.delete({
      where: {
        id: fabriquantId,
      },
    });
  };

  updateFabriquant = async (id: string, data: Prisma.FabriquantUpdateInput) => {
    const fabriquantExist = await prisma.fabriquant.findFirst({
      where: { id },
    });

    if (!fabriquantExist) throw new NotFoundError("Fabriquant not found");

    return prisma.fabriquant.update({
      where: {
        id,
      },
      data,
    });
  };

  getFabriquants = async (
    args: Prisma.FabriquantFindManyArgs
  ): Promise<PaginatedInterface<Fabriquant>> => {
    const [data, totalCount] = await Promise.all([
      prisma.fabriquant.findMany(args),
      prisma.fabriquant.count({ where: args.where ?? {} }),
    ]);
    return { paginatedResult: data, totalCount };
  };
}
