import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import Category from "@models/category";
import createError from "http-errors";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const title = req.body.title;
  const [error, category] = await to(Category.create({ title }));
  if (error) return next(error);
  return res.status(httpStatus.CREATED).json({ message: "Category created.", data: category });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, category] = await to(Category.findById(id).select("title subCategories").lean());
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: category });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const [error, categories] = await to(
    Category.find()
      .populate({
        path: "subCategories",
        select: "title",
      })
      .select("title subCategories")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  );
  if (error) return next(error);
  if (!categories) return next(createError(httpStatus.NOT_FOUND, "No categories found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: categories });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const title = req.body.title;
  const [error, category] = await to(Category.findOneAndUpdate({ _id: id }, { $set: { title: title } }, { new: true }));
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: category });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, category] = await to(Category.findOneAndDelete({ _id: id }));
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));
  return res.status(httpStatus.OK).json({ message: "Success" });
};

const getSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategories] = await to(
    Category.findById(id).populate({ path: "subCategories", select: "title" }).select("subCategories").lean(),
  );
  if (error) return next(error);
  if (!subCategories) return next(createError(httpStatus.NOT_FOUND, "No SubCategories found"));
  return res.status(200).json({
    data: subCategories,
  });
};

// const getAllPodcasts = async (
//   req: Request<Params>,
//   res: Response
// ): Promise<any> => {
//   const id = req.params.id;
//   const [error, podcasts] = await to(
//     Category.findById(id).populate("podcasts").lean()
//   );
//   if (error) return handleError(error, res);
//   return res.status(200).json({
//     data: podcasts,
//   });
// };

const CategoryController = {
  create,
  get,
  getAll,
  update,
  remove,
  getSubCategories,
  // getAllPodcasts,
};

export default CategoryController;
