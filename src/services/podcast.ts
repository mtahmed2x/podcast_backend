import { addPodcast } from "@controllers/history";
import Creator from "@models/creator";
import Favorite from "@models/favorite";
import Like from "@models/like";
import Podcast from "@models/podcast";
import Report from "@models/report";
import { PodcastSchema } from "@schemas/podcast";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import mongoose from "mongoose";

const popularPodcasts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0) {
    return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
  }
  let error, podcasts;
  [error, podcasts] = await to(
    Podcast.find()
      .select("title category cover audioDuration totalLikes")
      .populate({
        path: "category",
        select: "title -_id",
      })
      .sort({ totalLikes: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  );

  if (error) return next(error);

  if (!podcasts || podcasts.length === 0) {
    return res.status(httpStatus.OK).json({
      success: true,
      message: "No Podcast Found!",
      data: podcasts,
      pagination: {
        page,
        limit,
        total: await Podcast.countDocuments(),
      },
    });
  }
  podcasts = podcasts.map((podcast: any) => ({
    ...podcast,
    audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
  }));
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
};

const latestPodcasts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0) {
    return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
  }
  let error, podcasts;
  [error, podcasts] = await to(
    Podcast.find()
      .select("title category cover audioDuration createdAt updatedAt")
      .populate({
        path: "category",
        select: "title -_id",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  );
  if (error) return next(error);

  if (!podcasts || podcasts.length === 0) {
    return res.status(httpStatus.OK).json({
      success: true,
      message: "No Podcast Found!",
      data: podcasts,
      pagination: {
        page,
        limit,
        total: await Podcast.countDocuments(),
      },
    });
  }
  podcasts = podcasts.map((podcast: any) => ({
    ...podcast,
    audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
  }));
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
};

const reportPodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { podcastId, description } = req.body;
  const user = req.user;
  let error, podcast, creator: any, report;
  [error, podcast] = await to(Podcast.findById(podcastId));
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

  [error, creator] = await to(
    Creator.findById(podcast.creator).populate({ path: "user", select: "name" }),
  );
  if (error) return next(error);
  if (!creator) return next(createError(httpStatus.NOT_FOUND, "Creator Not Found"));

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    report = await Report.create({
      podcastId,
      podcastName: podcast.title,
      podcastCover: podcast.cover,
      cretorName: creator.user?.name,
      userName: user.name,
      date: new Date(),
      description,
    });
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return next(error);
  } finally {
    session.endSession();
  }
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: report });
};

const play = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const id = req.params.id;
  let error,
    podcast,
    like,
    favorite,
    isLiked = false,
    isFavorited = false;
  [error, podcast] = await to(
    Podcast.findById(id)
      .populate({
        path: "creator",
        select: "user -_id donations",
        populate: {
          path: "user",
          select: "name -_id",
        },
      })
      .populate({
        path: "category",
        select: "title",
      })
      .populate({
        path: "subCategory",
        select: "title",
      }),
  );
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

  if (podcast.creator) {
    const creator = podcast.creator as any;
    creator.donations = creator.donations ?? null;
  }

  let audioDuration = "";
  if (podcast as PodcastSchema) {
    audioDuration = `${(podcast.audioDuration / 60).toFixed(2)} min`;
  }

  await addPodcast(user.userId, podcast._id!.toString());

  podcast.totalViews += 1;
  await podcast.save();

  [error, like] = await to(Like.findOne({ podcast: id, user: user.userId }));
  if (error) return next(error);
  console.log(isLiked);

  if (like) isLiked = true;
  console.log(like);

  console.log(isLiked);

  [error, favorite] = await to(Favorite.findOne({ user: user.userId, podcasts: id }));
  if (error) return next(error);
  if (favorite) isFavorited = true;

  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success", data: { podcast, isLiked, isFavorited } });
};

const playNext = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const id = req.params.id;

  let error, randomPodcast;
  [error, randomPodcast] = await to(
    Podcast.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(id) },
        },
      },
      { $sample: { size: 1 } },
    ]),
  );
  if (error) return next(error);

  if (!randomPodcast || randomPodcast.length === 0) {
    return res.status(httpStatus.OK).json({
      success: true,
      message: "No Podcast Found",
      data: null,
    });
  }

  [error, randomPodcast] = await to(
    Podcast.findById(randomPodcast[0]._id)
      .populate({
        path: "creator",
        select: "user -_id donations",
        populate: {
          path: "user",
          select: "name -_id",
        },
      })
      .populate({
        path: "category",
        select: "title",
      })
      .populate({
        path: "subCategory",
        select: "title",
      })
      .lean(),
  );
  if (error) return next(error);

  if (randomPodcast!.creator) {
    const creator = randomPodcast!.creator as any;
    creator.donations = creator.donations ?? null;
  }

  if (!randomPodcast) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Random Podcast Not Found",
    });
  }

  let isLiked = false,
    isFavorited = false;
  let like, favorite;

  [error, like] = await to(Like.findOne({ podcast: randomPodcast._id, user: user.userId }));
  if (error) return next(error);
  if (like) isLiked = true;

  [error, favorite] = await to(
    Favorite.findOne({ podcasts: randomPodcast._id, user: user.userId }),
  );
  if (error) return next(error);
  if (favorite) isFavorited = true;

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: {
      podcast: randomPodcast,
      isLiked,
      isFavorited,
    },
  });
};

const PodcastServices = {
  play,
  playNext,
  latestPodcasts,
  popularPodcasts,
  reportPodcast,
};

export default PodcastServices;
