import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { logger } from "@shared/logger";
import httpStatus from "http-status";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  logger.error(`${err.message}\n${err.stack}\n${err.name}`);
  if (createError.isHttpError(err)) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message, data: {} });
  } else if (err.name === "ValidationError") {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: err.message, data: {} });
  }

  return res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .json({ success: false, message: err.message, data: {} });
};
