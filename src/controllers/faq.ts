import Faq from "@models/faq";
import { NextFunction, Request, Response } from "express";

const add = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { question, answer } = req.body;
  const faq = await Faq.create({ question, answer });
  res.status(201).json({ data: faq });
};

const FaqController = {
  add,
};
export default FaqController;
