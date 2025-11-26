import { Router } from "express";

import catchMiddleware from "../middlewares/api";
import validateMiddleware from "../middlewares/validate";
import ArticleController from "../controllers/article";

const articleRouter = Router();
const articleController = new ArticleController();

articleRouter.post(
  "/",
  validateMiddleware("createArticle"),
  catchMiddleware(articleController.createArticle)
);
articleRouter.get("/", catchMiddleware(articleController.getArticles));

articleRouter.patch("/:id", catchMiddleware(articleController.updateArticle));
articleRouter.delete("/:id", catchMiddleware(articleController.deleteArticle));

export default articleRouter;
