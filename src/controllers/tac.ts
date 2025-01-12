import TaC from "@models/tac";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import httpStatus from "http-status";

const add = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { text } = req.body;
  const [error, tac] = await to(TaC.create({ text: text }));
  if (error) return next(error);
  res.status(httpStatus.CREATED).json({ success: true, message: "Success", data: tac });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, tac] = await to(TaC.findOne().lean());
  if (error) return next(error);
  if (!tac)
    return res
      .status(httpStatus.OK)
      .json({ success: true, message: "No terms and conditions", data: {} });
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: tac });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { text } = req.body;
  const [error, tac] = await to(TaC.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
  if (error) return next(error);
  if (!tac) return next(createError(httpStatus.NOT_FOUND, "Terms and condition not found"));
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: tac });
};

const TaCController = {
  add,
  get,
  update,
};

export default TaCController;
