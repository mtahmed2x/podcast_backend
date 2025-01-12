import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Category from "@models/category";
import Creator from "@models/creator";
import httpStatus from "http-status";
import Podcast from "@models/podcast";
import Admin from "@models/admin";
import { Types } from "mongoose";

const homeController = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const location = req.user.locationPreference || null;
    const defaultAvatar = "uploads/default/default-avatar.png";

    const formatAudioDuration = (duration: number): string => `${(duration / 60).toFixed(2)} min`;

    /* Categories */
    const categoriesPromise = Category.find().select("title categoryImage").limit(4).lean();

    /* Admin */
    const adminAccount = await Admin.findOne().lean();
    const creatorId = adminAccount?.creator || new Types.ObjectId(process.env.CREATORID);
    const adminPromise = Podcast.aggregate([
      { $match: { creator: creatorId } },
      { $sort: { totalLikes: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "creators",
          localField: "creator",
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
          avatar: { $ifNull: ["$userDetails.avatar", defaultAvatar] },
          podcast: "$_id",
        },
      },
    ]);

    /* Creators */
    const creatorsPromise = Podcast.aggregate([
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
      { $limit: 5 },
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
          avatar: { $ifNull: ["$userDetails.avatar", defaultAvatar] },
          podcast: 1,
        },
      },
    ]);

    /* Podcasts */
    const fetchPodcasts = async (sortField: string, limit: number, locationFilter: boolean) => {
      const query = locationFilter && location ? { location } : {};
      const podcasts = await Podcast.find(query)
        .select("title category cover audioDuration")
        .populate({
          path: "category",
          select: "title -_id",
        })
        .sort({ [sortField]: -1 })
        .limit(limit)
        .lean();

      if (locationFilter && podcasts.length === 0 && location) {
        // Fallback to original query if location-filtered query yields no results
        return Podcast.find()
          .select("title category cover audioDuration")
          .populate({
            path: "category",
            select: "title -_id",
          })
          .sort({ [sortField]: -1 })
          .limit(limit)
          .lean();
      }

      return podcasts;
    };

    const newPodcastsPromise = fetchPodcasts("createdAt", 2, true);
    const popularPodcastsPromise = fetchPodcasts("totalLikes", 3, true);

    const [categories, admin, creators, newPodcasts, popularPodcasts] = await Promise.all([
      categoriesPromise,
      adminPromise,
      creatorsPromise,
      newPodcastsPromise,
      popularPodcastsPromise,
    ]);

    const formatPodcasts = (podcasts: any[]) =>
      podcasts.map((podcast) => ({
        ...podcast,
        audioDuration: formatAudioDuration(podcast.audioDuration),
      }));

    return res.status(httpStatus.OK).json({
      success: true,
      message: "Success",
      data: {
        location,
        categories,
        admin: admin[0] || null,
        creators,
        newPodcasts: formatPodcasts(newPodcasts),
        popularPodcasts: formatPodcasts(popularPodcasts),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export default homeController;
