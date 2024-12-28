import Like from "@models/like";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { updateLikeCount } from "@controllers/podcast";
// import { addNotification, removeLikeNotification } from "@controllers/notification";
import { Subject } from "@shared/enums";
import Podcast from "@models/podcast";
import createError from "http-errors";
import httpStatus from "http-status";
import { addNotification } from "src/services/notification";
import Creator from "@models/creator";
import { Types } from "mongoose";

const likeToggle = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const id = req.params.id;
  let error, podcast, like, value;
  [error, podcast] = await to(Podcast.findById(id));
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

  [error, like] = await to(Like.findOne({ user: user.userId, podcast: id }));
  if (error) return next(error);
  if (!like) {
    [error] = await to(Like.create({ user: user.userId, podcast: id }));
    if (error) return next(error);
    value = 1;
    await updateLikeCount(id, value);
  } else {
    [error] = await to(Like.findByIdAndDelete(like._id));
    if (error) return next(error);
    value = -1;
    await updateLikeCount(id, value);
  }
  const creator = await Creator.findById(podcast.creator);
  if (creator?.user) {
    if (value === 1)
      await addNotification(Subject.LIKE, creator.user, { podcast: podcast._id as Types.ObjectId });
  }

  // if (value == 1) await addNotification(id, user.userId, Subject.LIKE);
  // if (value == -1) await removeLikeNotification(id, user.userId);

  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success", data: { like: value === 1 } });
};

const LikeController = {
  likeToggle,
};

export default LikeController;
