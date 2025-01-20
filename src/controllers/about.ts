import About from "@models/about";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import httpStatus from "http-status";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { text } = req.body;
  const [error, about] = await to(About.create({ text: text }));
  if (error) return next(error);
  res.status(httpStatus.CREATED).json({ success: true, message: "Success", data: about });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, about] = await to(About.findOne());
  if (error) return next(error);
  if (!about)
    return res.status(httpStatus.OK).json({ success: true, message: "No about us", data: {} });
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: about });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { text } = req.body;
  const [error, about] = await to(
    About.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }),
  );
  if (error) return next(error);
  if (!about) return next(createError(httpStatus.NOT_FOUND, "About us not found"));
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: about });
};

const AboutController = {
  create,
  get,
  update,
};

export default AboutController;
