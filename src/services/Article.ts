import { AlreadyExistsError, NotFoundError } from "../utils/appErrors";
import prisma from "../config/database";

import { createArticleCredentials } from "../validations/article";
import { Article, Prisma } from "@prisma/client";
import { PaginatedInterface } from "../utils/type";

export default class ArticleService {
  createArticle = async (data: createArticleCredentials) => {
    const { number, exportedAt, quantity, technicienId } = data;

    const articleExist = await prisma.article.findUnique({
      where: { number },
    });
    if (articleExist) throw new AlreadyExistsError("Article already exist");
    const userExists = await prisma.user.findUnique({
      where: { id: technicienId },
    });
    if (!userExists) throw new NotFoundError("Technicien not found");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const exportedDate = new Date(exportedAt);

    if (exportedDate < tomorrow) {
      throw new Error("exportedAt must be at least 1 day after today");
    }

    const newArticle = await prisma.article.create({
      data: { number, exportedAt, quantity, technicienId },
    });

    return newArticle;
  };

  deleteArticle = async (articleId: string) => {
    const articleExist = await prisma.article.findFirst({
      where: { id: articleId },
    });

    if (!articleExist) throw new NotFoundError("Article not found");

    return prisma.article.delete({
      where: {
        id: articleId,
      },
    });
  };

  updateArticle = async (id: string, data: Prisma.ArticleUpdateInput) => {
    const articleExist = await prisma.article.findFirst({
      where: { id },
    });

    if (!articleExist) throw new NotFoundError("Article not found");

    return prisma.article.update({
      where: {
        id,
      },
      data,
    });
  };

  getArticles = async (
    args: Prisma.ArticleFindManyArgs
  ): Promise<PaginatedInterface<Article>> => {
    const [data, totalCount] = await Promise.all([
      prisma.article.findMany(args),
      prisma.article.count({ where: args.where ?? {} }),
    ]);
    return { paginatedResult: data, totalCount };
  };
}
