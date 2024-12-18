import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Category from "@models/category";
import Creator from "@models/creator";
import httpStatus from "http-status";
import Podcast from "@models/podcast";
import { CreatorSchema } from "@schemas/creator";

const homeController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, categories, creators, newPodcasts, popularPodcasts;
  [error, categories] = await to(Category.find().select("title").limit(4).lean());
  if (error) return next(error);

  const defaultCategoryImage = "uploads/default/default-catrgoty.png"; // Default image location
  categories = categories.map((category: any) => ({
    ...category,
    image: defaultCategoryImage, // Add image field with default value
  }));

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
  const defaultAvatar = "uploads/default/default-avatar.png";
  creators = creators.map((creator: any) => {
    if (creator.user?.avatar == null) {
      creator.user.avatar = defaultAvatar;
    }
    return creator;
  });
  if (error) return next(error);
  [error, newPodcasts] = await to(
    Podcast.find()
      .select("title category cover audioDuration")
      .populate({
        path: "category",
        select: "title -_id",
      })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean(),
  );

  if (error) return next(error);
  newPodcasts = newPodcasts.map((podcast: any) => ({
    ...podcast,
    audioDuration: (podcast.audioDuration / 60).toFixed(2),
  }));

  [error, popularPodcasts] = await to(
    Podcast.find()
      .select("title category cover audioDuration")
      .populate({
        path: "category",
        select: "title -_id",
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  );

  if (error) return next(error);
  popularPodcasts = popularPodcasts.map((podcast: any) => ({
    ...podcast,
    audioDuration: (podcast.audioDuration / 60).toFixed(2),
  }));

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: { categories, creators, newPodcasts, popularPodcasts },
  });
};

export default homeController;
