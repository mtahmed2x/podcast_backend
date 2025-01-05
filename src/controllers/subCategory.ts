import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import Category from "@models/category";
import SubCategory from "@models/subCategory";
import { Types } from "mongoose";
import createError from "http-errors";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
import Cloudinary from "@shared/cloudinary";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, category, subCategory;
  const { categoryId, title, subcategoryImageUrl } = req.body;

  [error, category] = await to(Category.findById(categoryId));
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category not found!"));

  [error, subCategory] = await to(
    SubCategory.create({ title: title, subCategoryImage: subcategoryImageUrl }),
  );
  if (error) return next(error);

  category.subCategories.push(subCategory._id as Types.ObjectId);
  console.log(category);
  [error] = await to(category.save());
  if (error) return next(error);

  return res
    .status(httpStatus.CREATED)
    .json({ success: true, message: "Success", data: subCategory });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, subCategory] = await to(SubCategory.findById(id).populate("podcasts").lean());
  if (error) return next(error);
  if (!subCategory) return res.status(404).json({ error: "SubCategory not found!" });
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: subCategory });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [error, subCategories] = await to(
    SubCategory.find().populate("podcasts").skip(skip).limit(limit).lean(),
  );
  if (error) return next(error);
  if (!subCategories) return next(createError(httpStatus.NOT_FOUND, "No Subcategories Found"));
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: subCategories });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const { title, subcategoryImageUrl } = req.body;
  if(!title || !subcategoryImageUrl) {
    return next(createError(httpStatus.BAD_REQUEST, "Nothing to update"));
  }

  let error, subCategory;
  [error, subCategory] = await to(SubCategory.findById(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory not found"));

  subCategory.title = title || subCategory.title;
  if(subcategoryImageUrl) {
    Cloudinary.remove(subCategory.subCategoryImage);
    subCategory.subCategoryImage = subcategoryImageUrl;
  }

  [error] = await to(subCategory.save());
  if (error) return next(error);

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: subCategory });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;

  let error, subCategory;
  [error, subCategory] = await to(SubCategory.findById(id));
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory not found"));

  Cloudinary.remove(subCategory.subCategoryImage);

  [error, subCategory] = await to(SubCategory.findByIdAndDelete(id));
  if (error) return next(error);
  
  const category = await Category.findOneAndUpdate(
    { subCategories: id },
    { $pull: { subCategories: id } },
    { new: true },
  );
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));

  return res.status(httpStatus.OK).json({ message: "Success" });
};

const getPodcasts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0) {
    return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
  }

  const id = req.params.id;

  let error, subCategories, podcasts;

  [error, subCategories] = await to(
    SubCategory.findById(id)
      .populate({
        path: "podcasts",
        select: "creator category cover title audioDuration",
        populate: [
          {
            path: "creator",
            select: "user -_id",
            populate: {
              path: "user",
              select: "name -_id",
            },
          },
          {
            path: "category",
            select: "title -_id",
          },
        ],
      })
      .lean(),
  );
  if (error) return next(error);
  if (!subCategories) return next(createError(httpStatus.NOT_FOUND, "SubCategories not found"));

  if (!subCategories.podcasts || subCategories.podcasts.length === 0) {
    return res
      .status(httpStatus.OK)
      .json({ success: true, message: "No Podcasts Found!", data: [] });
  }

  const totalPodcasts = subCategories.podcasts.length;
  const paginatedPodcasts = subCategories.podcasts.slice((page - 1) * limit, page * limit);

  const formattedPodcasts = paginatedPodcasts.map((podcast: any) => ({
    ...podcast,
    audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
  }));

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: {
      podcasts: formattedPodcasts,
      currentPage: page,
      totalPages: Math.ceil(totalPodcasts / limit),
      totalPodcasts,
    },
  });
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
