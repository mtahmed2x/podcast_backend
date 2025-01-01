import { Request, Response, NextFunction } from "express";
import Report from "@models/report";
import to from "await-to-ts";
import httpStatus from "http-status";
import createError from "http-errors";
import Podcast from "@models/podcast";

const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const userName = req.user.name;
  const { podcastId, description } = req.body;
  let error, podcast, report;
  [error, podcast] = await to(
    Podcast.findById(podcastId)
      .populate({
        path: "creator",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .then((podcast) => podcast as any),
  );
  if (error) return next(error);
  if (!podcast)
    return next(createError(httpStatus.NOT_FOUND, "Podcast not found"));

  [error, report] = await to(
    Report.create({
      podcastId,
      podcastName: podcast.title,
      podcastCover: podcast.cover,
      creatorName: podcast.creator.user.name,
      userName,
      date: Date.now(),
      description,
    }),
  );
  if (error) return next(error);
  return res
    .status(httpStatus.CREATED)
    .json({ success: true, message: "Success", data: report });
};

const get = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const [error, reports] = await to(
    Report.find().limit(limit).skip(skip).lean(),
  );
  if (error) {
    return next(error);
  }
  if (!reports)
    return next(createError(httpStatus.NOT_FOUND, "Reports not found"));
  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success", data: reports });
};

const reportController = {
  create,
  get,
};

export default reportController;
