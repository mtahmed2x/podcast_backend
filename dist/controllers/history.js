"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPodcast = void 0;
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const history_1 = __importDefault(require("../models/history"));
const logger_1 = require("../shared/logger");
const mongoose_1 = require("mongoose");
const addPodcast = async (userId, podcastId) => {
    let error, history;
    [error, history] = await (0, await_to_ts_1.default)(history_1.default.findOne({ user: userId }));
    if (error)
        logger_1.logger.error(error);
    if (!history) {
        [error, history] = await (0, await_to_ts_1.default)(history_1.default.create({ user: userId }));
        if (error)
            logger_1.logger.error(error);
    }
    if (!history.podcasts.includes(new mongoose_1.Types.ObjectId(podcastId))) {
        history.podcasts.push(new mongoose_1.Types.ObjectId(podcastId));
    }
    [error] = await (0, await_to_ts_1.default)(history.save());
    if (error)
        logger_1.logger.error(error);
};
exports.addPodcast = addPodcast;
const get = async (req, res, next) => {
    const page = Math.max(Number(req.query.page) || 1, 1); // Ensure page is at least 1
    const limit = Math.max(Number(req.query.limit) || 10, 1); // Ensure limit is at least 1
    if (page <= 0 || limit <= 0) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    }
    const user = req.user;
    let error, history;
    [error, history] = await (0, await_to_ts_1.default)(history_1.default.findOne({ user: user.userId })
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
        .lean());
    if (error)
        return next(error);
    if (!history) {
        [error, history] = await (0, await_to_ts_1.default)(history_1.default.create({ user: user.userId }));
        if (error)
            return next(error);
        return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: history });
    }
    if (!history.podcasts || history.podcasts.length === 0) {
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: "No Podcasts Found",
            data: {
                podcasts: [],
                currentPage: page,
                totalPodcasts: 0,
                totalPages: 0,
            },
        });
    }
    // Pagination logic for podcasts array
    const totalPodcasts = history.podcasts.length;
    const paginatedPodcasts = history.podcasts.slice((page - 1) * limit, page * limit);
    // Convert audioDuration to minutes with "min" appended
    const formattedPodcasts = paginatedPodcasts.map((podcast) => ({
        ...podcast,
        audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
    }));
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: {
            podcasts: formattedPodcasts,
            currentPage: page,
            totalPodcasts,
            totalPages: Math.ceil(totalPodcasts / limit),
        },
    });
};
const remove = async (req, res, next) => {
    const user = req.user;
    const id = req.params.id;
    let error, history;
    [error, history] = await (0, await_to_ts_1.default)(history_1.default.findOne({ user: user.userId }));
    if (error)
        return next(error);
    if (!history)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "No History"));
    [error, history] = await (0, await_to_ts_1.default)(history_1.default.findByIdAndUpdate(history._id, { $pull: { podcasts: id } }, { new: true }));
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ message: "Success", data: history });
};
const HistoryController = {
    get,
    remove,
};
exports.default = HistoryController;
