import Auth from "@models/auth";
import Podcast from "@models/podcast";
import handleError from "@utils/handleError";
import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import createError from "http-errors";

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
    getAllPodcasts,
};

export default CreatorController;
