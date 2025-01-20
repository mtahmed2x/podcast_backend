import Auth from "@models/auth";
import Podcast from "@models/podcast";
import handleError from "@utils/handleError";
import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import createError from "http-errors";
import Admin from "@models/admin";
import { Types } from "mongoose";

const topCreators = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const adminAccount = await Admin.findOne().lean();
  const creatorId = adminAccount?.creator || new Types.ObjectId(process.env.CREATORID);
  const { page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  const skip = (pageNumber - 1) * limitNumber;

  const [err, creators] = await to(
    Podcast.aggregate([
      { $match: { creator: { $ne: creatorId } } },
      {
        $group: {
          _id: "$creator",
          totalLikes: { $max: "$totalLikes" },
          podcast: { $first: "$_id" },
          title: { $first: "$title" },
          description: { $first: "$description" },
        },
      },
      { $sort: { totalLikes: -1 } },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $lookup: {
          from: "creators",
          localField: "_id",
          foreignField: "_id",
          as: "creatorDetails",
        },
      },
      { $unwind: "$creatorDetails" },
      {
        $lookup: {
          from: "users",
          localField: "creatorDetails.user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          name: "$userDetails.name",
          avatar: { $ifNull: ["$userDetails.avatar", null] },
          podcast: 1,
        },
      },
    ]),
  );

  if (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }

  return res.status(200).json({
    success: true,
    data: creators,
    page: pageNumber,
    limit: limitNumber,
  });
};

const getAllPodcasts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0) {
    return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
  }
  let error, podcasts;
  [error, podcasts] = await to(
    Podcast.find({ creator: user.creatorId })
      .select("title category cover audioDuration")
      .populate({
        path: "category",
        select: "title -_id",
      })
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

const CreatorController = {
  topCreators,
  getAllPodcasts,
};

export default CreatorController;
