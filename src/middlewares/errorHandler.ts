import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): any => {
  if (createError.isHttpError(err)) {
    console.error(`${err.message}\n${err.stack}\n${err.name}`);
    return res.status(err.status).json({ error: err.message });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  console.error(`${err.message}\n${err.stack}\n${err.name}`);
  return res.status(500).json({ error: err.message });
};
