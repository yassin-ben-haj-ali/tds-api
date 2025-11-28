import { Request, Response, NextFunction } from "express";

const catchMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => void
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.log(error)
      next(error);
    });
  };
};

export default catchMiddleware;