"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const http_errors_1 = __importDefault(require("http-errors"));
const favorite_1 = __importDefault(require("../models/favorite"));
const podcast_1 = __importDefault(require("../models/podcast"));
const podcast_2 = require("./podcast");
const ensureFavorite = async (userId, isPopulate) => {
    let error, favorite;
    if (isPopulate) {
        [error, favorite] = await (0, await_to_ts_1.default)(favorite_1.default.findOne({ user: userId }).populate({
            path: "podcasts",
            select: "creator cover title",
            populate: {
                path: "creator",
                select: "user -_id",
                populate: { path: "user", select: "name -_id" },
            },
        }));
    }
    else
        [error, favorite] = await (0, await_to_ts_1.default)(favorite_1.default.findOne({ user: userId }));
    if (error)
        throw error;
    if (!favorite) {
        [error, favorite] = await (0, await_to_ts_1.default)(favorite_1.default.create({ user: userId }));
        if (error)
            throw error;
    }
    return favorite;
};
const get = async (req, res, next) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    if (page <= 0 || limit <= 0) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    }
    const user = req.user;
    let error, favorite;
    [error, favorite] = await (0, await_to_ts_1.default)(favorite_1.default.findOne({ user: user.userId })
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
    if (!favorite || !favorite.podcasts || favorite.podcasts.length === 0) {
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No Podcast Found", data: { podcasts: [] } });
    }
    const totalPodcasts = favorite.podcasts.length;
    const paginatedPodcasts = favorite.podcasts.slice((page - 1) * limit, page * limit);
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
            totalPages: Math.ceil(totalPodcasts / limit),
            totalPodcasts,
        },
    });
};
const toggle = async (req, res, next) => {
    const user = req.user;
    const { podcastId } = req.body;
    let error, podcast, favorite;
    [error, podcast] = await (0, await_to_ts_1.default)(podcast_1.default.findById(podcastId));
    if (error)
        return next(error);
    if (!podcast)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Podcast not found"));
    favorite = await ensureFavorite(user.userId, false);
    const isPodcastFavorite = favorite.podcasts.includes(podcastId);
    const updateAction = isPodcastFavorite ? "$pull" : "$push";
    const value = isPodcastFavorite ? -1 : 1;
    [error, favorite] = await (0, await_to_ts_1.default)(favorite_1.default.findByIdAndUpdate(favorite._id, { [updateAction]: { podcasts: podcastId } }, { new: true }).lean());
    if (error)
        return next(error);
    await (0, podcast_2.updateFavoriteCount)(podcastId, value);
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success", data: { favorite: !isPodcastFavorite } });
};
const FavoriteController = {
    get,
    toggle,
};
exports.default = FavoriteController;
