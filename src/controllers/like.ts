import Like from "@models/like";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { updateLikeCount } from "@controllers/podcast";
import { addNotification, removeLikeNotification } from "@controllers/notification";
import { Subject } from "@shared/enums";
import Podcast from "@models/podcast";
import createError from "http-errors";
import httpStatus from "http-status";

const likeToggle = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { podcastId } = req.body;
  let error, podcast, like, value;
  [error, podcast] = await to(Podcast.findById(podcastId));
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

  [error, like] = await to(Like.findOne({ user: user.userId, podcast: podcastId }));
  if (error) return next(error);
  if (!like) {
    [error] = await to(Like.create({ user: user.userId, podcast: podcastId }));
    if (error) return next(error);
    value = 1;
    await updateLikeCount(podcastId, value);
  } else {
    [error] = await to(Like.findByIdAndDelete(like._id));
    if (error) return next(error);
    value = -1;
    await updateLikeCount(podcastId, value);
  }

  if (value == 1) await addNotification(podcastId, user.userId, Subject.LIKE);
  if (value == -1) await removeLikeNotification(podcastId, user.userId);

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: {} });
};

const LikeController = {
  likeToggle,
};

export default LikeController;
