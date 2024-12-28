import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Category from "@models/category";
import Creator from "@models/creator";
import httpStatus from "http-status";
import Podcast from "@models/podcast";
import Admin from "@models/admin";

const homeController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const location = req.user.locationPreference || null;

  let error, admin, categories, creators, newPodcasts, popularPodcasts;

  [error, categories] = await to(Category.find().select("title categoryImage").limit(4).lean());
  if (error) return next(error);
  [error, admin] = await to(
    Admin.findOne().select("user").populate({ path: "user", select: "name avatar -_id" }).lean(),
  );
  if (error) return next(error);

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
  const defaultAvatar = "uploads/default/default-avatar.png";
  creators = await Promise.all(
    creators.map(async (creator: any) => {
      if (creator.user?.avatar == null) {
        creator.user.avatar = defaultAvatar;
      }
      const podcast = await Podcast.findOne({ creator: creator._id }).select("_id").limit(1).lean();
      creator.podcast = podcast || null;
      return creator;
    }),
  );

  const formatAudioDuration = (duration: number): string => {
    return (duration / 60).toFixed(2) + " min";
  };

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
    audioDuration: formatAudioDuration(podcast.audioDuration),
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
    audioDuration: formatAudioDuration(podcast.audioDuration),
  }));

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: { location: location, categories, admin, creators, newPodcasts, popularPodcasts },
  });
};

export default homeController;
