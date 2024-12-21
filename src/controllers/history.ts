import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import httpStatus from "http-status";
import History from "@models/history";
import { logger } from "@shared/logger";
import { Types } from "mongoose";

export const addPodcast = async (userId: string, podcastId: string) => {
    let error, history;
    [error, history] = await to(History.findOne({ user: userId }));
    if (error) logger.error(error);
    if (!history) {
        [error, history] = await to(History.create({ user: userId }));
        if (error) logger.error(error);
    }
    if (!history.podcasts.includes(new Types.ObjectId(podcastId))) {
        history.podcasts.push(new Types.ObjectId(podcastId));
    }
    [error] = await to(history.save());
    if (error) logger.error(error);
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page <= 0 || limit <= 0) {
        return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
    }
    const user = req.user;
    let error, history;
    [error, history] = await to(
        History.findOne({ user: user.userId })
            .select("podcasts")
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
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
    );
    if (error) return next(error);
    if (!history) {
        [error, history] = await to(History.create({ user: user.userId }));
        if (error) return next(error);
        return res.status(httpStatus.OK).json({ success: true, message: "Success", data: history });
    }
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: history });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const id = req.params.id;
    let error, history;
    [error, history] = await to(History.findOne({ user: user.userId }));
    if (error) return next(error);
    if (!history) return next(createError(httpStatus.NOT_FOUND, "No History"));
    [error, history] = await to(History.findByIdAndUpdate(history._id, { $pull: { podcasts: id } }, { new: true }));
    if (error) return next(error);
    return res.status(httpStatus.OK).json({ message: "Success", data: history });
};

const HistoryController = {
    get,
    remove,
};

export default HistoryController;
