import { Request, Response, NextFunction } from "express";
import { AuthValidatorSchema, FaqValidatorSchema } from "@validator/input";
import { fromZodError } from "zod-validation-error";
import createError from "http-errors";

export const validateRegisterInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = AuthValidatorSchema.safeParse(req.body);
  if (!result.success) {
    return next(createError(400, fromZodError(result.error)));
  }
  next();
};

export const validateFaqInput = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  console.log(req.body);

  const result = FaqValidatorSchema.safeParse(req.body);
  if (!result.success) {
    return next(createError(400, fromZodError(result.error)));
  }
  next();
};
