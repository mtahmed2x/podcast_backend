import Term from "@models/terms";
import { NextFunction, Request, Response } from "express";

const add = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { text } = req.body;
  const term = await Term.create(text);
  res.status(201).json({ data: term });
};

const TermController = { add };

export default TermController;
