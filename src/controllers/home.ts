import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Category from "@models/category";
import Creator from "@models/creator";
import httpStatus from "http-status";
import Podcast from "@models/podcast";

const homeController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, categories, creators, newPodcasts, popularPodcasts;
  [error, categories] = await to(Category.find().select("title").limit(4).lean());
  if (error) return next(error);
  console.log(categories);
  [error, creators] = await to(
    Creator.find()
      .select("user")
      .populate({
        path: "user",
        select: "name avatar -_id",
      })
      .limit(6)
      .lean(),
  );
  if (error) return next(error);
  [error, newPodcasts] = await to(
    Podcast.find()
      .select("category cover audioDuration")
      .populate({
        path: "category",
        select: "title -_id",
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean(),
  );

  if (error) return next(error);

  [error, popularPodcasts] = await to(
    Podcast.find()
      .select("category cover audioDuration")
      .populate({
        path: "category",
        select: "title -_id",
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  );

  if (error) return next(error);
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: { categories, creators, newPodcasts, popularPodcasts },
  });
};

export default homeController;
