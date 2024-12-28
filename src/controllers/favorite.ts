import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import httpStatus from "http-status";
import createError from "http-errors";

import Favorite from "@models/favorite";
import Podcast from "@models/podcast";
import { FavoriteSchema } from "@schemas/favorite";
import { updateFavoriteCount } from "./podcast";

const ensureFavorite = async (userId: string, isPopulate: boolean): Promise<FavoriteSchema> => {
  let error, favorite;
  if (isPopulate) {
    [error, favorite] = await to(
      Favorite.findOne({ user: userId }).populate({
        path: "podcasts",
        select: "creator cover title",
        populate: {
          path: "creator",
          select: "user -_id",
          populate: { path: "user", select: "name -_id" },
        },
      }),
    );
  } else [error, favorite] = await to(Favorite.findOne({ user: userId }));
  if (error) throw error;
  if (!favorite) {
    [error, favorite] = await to(Favorite.create({ user: userId }));
    if (error) throw error;
  }
  return favorite;
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  if (page <= 0 || limit <= 0) {
    return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
  }

  const user = req.user;

  let error, favorite;
  [error, favorite] = await to(
    Favorite.findOne({ user: user.userId })
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
  if (!favorite || !favorite.podcasts || favorite.podcasts.length === 0) {
    return res
      .status(httpStatus.OK)
      .json({ success: true, message: "No Podcast Found", data: { podcasts: [] } });
  }

  const totalPodcasts = favorite.podcasts.length;
  const paginatedPodcasts = favorite.podcasts.slice((page - 1) * limit, page * limit);

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

const toggle = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { podcastId } = req.body;
  let error, podcast, favorite;

  [error, podcast] = await to(Podcast.findById(podcastId));
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast not found"));

  favorite = await ensureFavorite(user.userId, false);

  const isPodcastFavorite = favorite.podcasts.includes(podcastId);
  const updateAction = isPodcastFavorite ? "$pull" : "$push";
  const value = isPodcastFavorite ? -1 : 1;
  [error, favorite] = await to(
    Favorite.findByIdAndUpdate(
      favorite._id,
      { [updateAction]: { podcasts: podcastId } },
      { new: true },
    ).lean(),
  );
  if (error) return next(error);
  await updateFavoriteCount(podcastId, value);
  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success", data: { favorite: !isPodcastFavorite } });
};

const FavoriteController = {
  get,
  toggle,
};
export default FavoriteController;
