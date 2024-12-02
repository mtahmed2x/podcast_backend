import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import Category from "@models/category";
import SubCategory from "@models/subCategory";
import { Types } from "mongoose";
import createError from "http-errors";
import httpStatus from "http-status";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, category, subCategory;
  const { categoryId, title } = req.body;

  [error, category] = await to(Category.findById(categoryId));
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category not found!"));

  [error, subCategory] = await to(SubCategory.create({ title }));
  if (error) return next(error);

  category.subCategories.push(subCategory._id as Types.ObjectId);
  [error] = await to(category.save());
  if (error) return next(error);

  return res.status(httpStatus.CREATED).json({ message: "Success", data: subCategory });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findById(id).populate("podcasts").lean());
  if (error) return next(error);
  if (!subCategory) return res.status(404).json({ error: "SubCategory not found!" });
  return res.status(httpStatus.OK).json({ message: "Success", data: subCategory });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [error, subCategories] = await to(SubCategory.find().populate("podcasts").skip(skip).limit(limit).lean());
  if (error) return next(error);
  if (!subCategories) return next(createError(httpStatus.NOT_FOUND, "No Subcategories Found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: subCategories });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const title = req.body.title;
  const [error, subCategory] = await to(
    SubCategory.findOneAndUpdate({ _id: id }, { $set: { title: title } }, { new: true }),
  );
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory not found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: subCategory });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findByIdAndDelete(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory not found"));
  const category = await Category.findOneAndUpdate(
    { subCategories: id },
    { $pull: { subCategories: id } },
    { new: true },
  );
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));
  return res.status(httpStatus.OK).json({ message: "Success" });
};

const getPodcasts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  let error, subCategory, podcasts;
  [error, subCategory] = await to(SubCategory.findById(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory not found"));

  [error, podcasts] = await to(
    subCategory.populate({
      path: "podcasts",
      populate: { path: "creator", select: "user", populate: { path: "user", select: "name -_id" } },
    }),
  );
  if (error) return next(error);
  if (!podcasts) return next(createError(httpStatus.NOT_FOUND, "No Podcasts found in the subCategory"));

  return res.status(httpStatus.OK).json({ message: "Success", data: podcasts });
};

const SubCategoryController = {
  create,
  getAll,
  get,
  update,
  remove,
  getPodcasts,
};

export default SubCategoryController;
