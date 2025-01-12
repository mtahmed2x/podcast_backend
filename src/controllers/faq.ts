import Faq from "@models/faq";
import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import httpStatus from "http-status";

const add = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { question, answer } = req.body;
  const [error, faq] = await to(Faq.create({ question, answer }));
  if (error) return next(error);
  res.status(httpStatus.CREATED).json({ success: true, message: "Success", data: faq });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, faqs] = await to(Faq.find().lean());
  if (error) return next(error);
  if (!faqs)
    return res
      .status(httpStatus.OK)
      .json({ success: true, message: "No Faq found", data: { faqs: [] } });
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: faqs });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { question, answer } = req.body;
  let error, faq;
  [error, faq] = await to(Faq.findById(id));
  if (error) return next(error);
  if (!faq) return next(createError(httpStatus.NOT_FOUND, "Faq Not Found"));

  faq.question = question || faq.question;
  faq.answer = answer || faq.answer;

  [error] = await to(faq.save());
  if (error) return next(error);

  res.status(httpStatus.OK).json({ success: true, message: "Success", data: faq });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, faq] = await to(Faq.findByIdAndDelete(id));
  if (error) return next(error);
  if (!faq) return next(createError(404, "Faq Not Found"));
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: {} });
};

const FaqController = {
  add,
  get,
  update,
  remove,
};
export default FaqController;
