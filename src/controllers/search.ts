import Category from "@models/category";
import SubCategory from "@models/subCategory";
import Podcast from "@models/podcast";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import httpStatus from "http-status";
import to from "await-to-ts";

export const searchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { query } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  if (!query || typeof query !== "string") {
    return next(
      createError(
        httpStatus.BAD_REQUEST,
        "Invalid query parameter",
      ),
    );
  }

  const regex = new RegExp(query, "i");

  const [error, categories] = await to(
    Category.find({ title: regex })
      .skip(skip)
      .limit(Number(limit)),
  );

  if (error) return next(error);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: {
      categories,
      totalResults: categories.length,
      page: Number(page),
      limit: Number(limit),
    },
  });
};

export const searchSubCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { query } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  if (!query || typeof query !== "string") {
    return next(
      createError(
        httpStatus.BAD_REQUEST,
        "Invalid query parameter",
      ),
    );
  }

  const regex = new RegExp(query, "i");

  const [error, subCategories] = await to(
    SubCategory.find({ title: regex })
      .skip(skip)
      .limit(Number(limit)),
  );

  if (error) return next(error);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: {
      subCategories,
      totalResults: subCategories.length,
      page: Number(page),
      limit: Number(limit),
    },
  });
};

export const searchPodcasts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { query } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  if (!query || typeof query !== "string") {
    return next(
      createError(
        httpStatus.BAD_REQUEST,
        "Invalid query parameter",
      ),
    );
  }
  const regex = new RegExp(query, "i");
  const [error, podcasts] = await to(
    Podcast.find({
      $or: [
        { title: regex },
        { description: regex },
        { location: regex },
        { "creator.user.name": regex },
        { "category.title": regex },
        { "subCategory.title": regex },
      ],
    })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "creator",
        select: "user -_id",
        populate: { path: "user", select: "name -_id" },
      })
      .populate({ path: "category", select: "title -_id" })
      .populate({
        path: "subCategory",
        select: "title -_id",
      }),
  );
  if (error) return next(error);

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: {
      podcasts,
      totalResults: podcasts.length,
      page: Number(page),
      limit: Number(limit),
    },
  });
};

const searchController = {
  searchCategories,
  searchSubCategories,
  searchPodcasts,
};
export default searchController;
