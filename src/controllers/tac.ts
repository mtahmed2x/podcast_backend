import TaC from "@models/tac";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

const add = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { text } = req.body;
  const [error, tac] = await to(TaC.create({ text: text }));
  if (error) return next(error);
  res.status(201).json({ message: "Success", data: tac });
};

const get = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const [error, tac] = await to(TaC.find().limit(1));
  if (error) return next(error);
  if (!tac) return next(createError(404, "Terms and Condition not found"));
  res.status(200).json({ message: "Success", data: tac });
};

const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const id = req.params.id;
  const { text } = req.body;
  const [error, tac] = await to(
    TaC.findByIdAndUpdate(id, { $set: { text: text } }, { new: true })
  );
  if (error) return next(error);
  if (!tac) return next(createError(404, "Terms and Condition not found"));
  res.status(200).json({ message: "Success", data: tac });
};

const TaCController = {
  add,
  get,
  update,
};

export default TaCController;
