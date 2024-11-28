import About from "@models/about";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

const add = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { text } = req.body;
  const [error, about] = await to(About.create({ text: text }));
  if (error) return next(error);
  res.status(201).json({ message: "Success", data: about });
};

const get = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const [error, about] = await to(About.find().limit(1));
  if (error) return next(error);
  if (!about) return next(createError(404, "About Us not found"));
  res.status(200).json({ message: "Success", data: about });
};

const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const id = req.params.id;
  const { text } = req.body;
  const [error, about] = await to(
    About.findByIdAndUpdate(id, { $set: { text: text } }, { new: true })
  );
  if (error) return next(error);
  if (!about) return next(createError(404, "About Us not found"));
  res.status(200).json({ message: "Success", data: about });
};

const AboutController = {
  add,
  get,
  update,
};

export default AboutController;
