import { Request, Response, NextFunction } from "express";
import validator from "../validations";
import { BadRequestError } from "../utils/appErrors";

const validateMiddleware = (schema: string) => {
  const validate = validator(schema);
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validate(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new BadRequestError(`Validation Error: ${error.message}`));
      } else {
        next(new BadRequestError(`Validation Error: ${String(error)}`));
      }
    }
  };
};
export default validateMiddleware;