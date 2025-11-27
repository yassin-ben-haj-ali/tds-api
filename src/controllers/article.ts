import { Request, Response } from "express";
import UserService from "../services/user";
import ArticleService from "../services/Article";
import { Prisma } from "@prisma/client";
import { processArgs } from "../utils/processArgs";

export default class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  createArticle = async (req: Request, res: Response) => {
    const { number, quantity, exportedAt } = req.body;
    const article = await this.articleService.createArticle({
      number,
      quantity,
      exportedAt,
    });
    return res
      .status(201)
      .json({ message: "Article created successfully", article });
  };

  deleteArticle = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Article id is required" });
    }
    const article = await this.articleService.deleteArticle(id);
    return res
      .status(201)
      .json({ message: "Article deleted successfully", article });
  };

  updateArticle = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Article id is required" });
    }
    const article = await this.articleService.updateArticle(id, req.body);
    return res
      .status(201)
      .json({ message: "Article updated successfully", article });
  };

  getArticles = async (req: Request, res: Response) => {
    const queryParse = req.query;
    const args = processArgs(queryParse);
    const queryArgs: Prisma.ArticleFindManyArgs = {
      where: args?.where as Prisma.ArticleWhereInput,
      orderBy: args?.orderBy as Prisma.ArticleOrderByWithRelationInput,
    };

    // Add skip only if defined
    if (args.skip !== undefined) {
      queryArgs.skip = parseInt(args.skip);
    }

    // Add take only if defined
    if (args.take !== undefined) {
      queryArgs.take = parseInt(args.take);
    }

    const articles = await this.articleService.getArticles(queryArgs);

    return res.status(201).json({
      paginatedResult: articles.paginatedResult,
      totalCount: articles.totalCount,
    });
  };
}
