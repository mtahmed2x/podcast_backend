"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const podcast_1 = __importDefault(require("../models/podcast"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const http_errors_1 = __importDefault(require("http-errors"));
const admin_1 = __importDefault(require("../models/admin"));
const mongoose_1 = require("mongoose");
const topCreators = async (req, res, next) => {
    const adminAccount = await admin_1.default.findOne().lean();
    const creatorId = adminAccount?.creator || new mongoose_1.Types.ObjectId(process.env.CREATORID);
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    const [err, creators] = await (0, await_to_ts_1.default)(podcast_1.default.aggregate([
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
    ]));
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
const getAllPodcasts = async (req, res, next) => {
    const user = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (page <= 0 || limit <= 0) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    }
    let error, podcasts;
    [error, podcasts] = await (0, await_to_ts_1.default)(podcast_1.default.find({ creator: user.creatorId })
        .select("title category cover audioDuration")
        .populate({
        path: "category",
        select: "title -_id",
    })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean());
    if (error)
        return next(error);
    if (!podcasts || podcasts.length === 0) {
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: "No Podcast Found!",
            data: podcasts,
            pagination: {
                page,
                limit,
                total: await podcast_1.default.countDocuments(),
            },
        });
    }
    podcasts = podcasts.map((podcast) => ({
        ...podcast,
        audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
    }));
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: podcasts });
};
const CreatorController = {
    topCreators,
    getAllPodcasts,
};
exports.default = CreatorController;
