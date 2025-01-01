import Privacy from "@models/privacy";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import httpStatus from "http-status";

const add = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { text } = req.body;
  const [error, privacy] = await to(Privacy.create({ text: text }));
  if (error) return next(error);
  res.status(httpStatus.CREATED).json({ success: true, message: "Success", data: privacy });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, privacy] = await to(Privacy.findOne());
  if (error) return next(error);
  if (!privacy) return res.status(httpStatus.OK).json({success: true, message: "No privacy policy", data : {} });
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: privacy });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { text } = req.body;
  const [error, privacy] = await to(Privacy.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
  if (error) return next(error);
  if (!privacy) return next(createError(httpStatus.NOT_FOUND, "Privacy policy not found"));
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: privacy });
};

const PrivacyController = {
  add,
  get,
  update,
};

export default PrivacyController;
