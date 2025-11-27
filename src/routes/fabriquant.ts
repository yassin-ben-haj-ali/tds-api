import { Router } from "express";
import catchMiddleware from "../middlewares/api";
import validateMiddleware from "../middlewares/validate";
import FabriquantController from "../controllers/fabriquant";

const fabriquantRouter = Router();
const fabriquantController = new FabriquantController();

fabriquantRouter.post(
  "/",
  validateMiddleware("createFabriquant"),
  catchMiddleware(fabriquantController.createFabriquant)
);
fabriquantRouter.get("/", catchMiddleware(fabriquantController.getFabriquants));

fabriquantRouter.patch(
  "/:id",
  catchMiddleware(fabriquantController.updateFabriquant)
);
fabriquantRouter.delete(
  "/:id",
  catchMiddleware(fabriquantController.deleteFabriquant)
);

export default fabriquantRouter;
