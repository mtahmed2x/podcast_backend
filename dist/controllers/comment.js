"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = __importDefault(require("../models/comment"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const podcast_1 = require("./podcast");
// import { addNotification, removeLikeNotification } from "./notification";
const enums_1 = require("../shared/enums");
const podcast_2 = __importDefault(require("../models/podcast"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const notification_1 = require("../services/notification");
const creator_1 = __importDefault(require("../models/creator"));
const addComment = async (req, res, next) => {
    const user = req.user;
    const id = req.params.id;
    const { text } = req.body;
    let error, podcast, comment;
    [error, podcast] = await (0, await_to_ts_1.default)(podcast_2.default.findById(id));
    if (error)
        return next(error);
    if (!podcast)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Podcast Not Found"));
    [error, comment] = await (0, await_to_ts_1.default)(comment_1.default.create({
        user: user.userId,
        podcast: id,
        text: text,
    }));
    if (error)
        return next(error);
    await (0, podcast_1.updateCommentCount)(id);
    const creator = await creator_1.default.findById(podcast.creator);
    if (creator?.user) {
        await (0, notification_1.addNotification)(enums_1.Subject.COMMENT, creator.user, {
            podcast: podcast._id,
        });
    }
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: comment,
    });
};
const get = async (req, res, next) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let error, podcast, comments, totalComments;
    [error, podcast] = await (0, await_to_ts_1.default)(podcast_2.default.findById(id));
    if (error)
        return next(error);
    if (!podcast)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Podcast Not Found"));
    [error, totalComments] = await (0, await_to_ts_1.default)(comment_1.default.countDocuments({ podcast: id }));
    if (error)
        return next(error);
    [error, comments] = await (0, await_to_ts_1.default)(comment_1.default.find({ podcast: id })
        .select("user text")
        .populate({
        path: "user",
        select: "avatar name",
    })
        .skip(skip)
        .limit(limit));
    if (error)
        return next(error);
    if (!comments)
        return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: [] });
    const defaultAvatar = "uploads/default/default-avatar.png";
    comments = comments.map((comment) => {
        if (comment.user?.avatar == null) {
            comment.user.avatar = defaultAvatar;
        }
        return comment;
    });
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: { comments, currentPage: page, limit },
    });
};
const CommentController = {
    addComment,
    get,
};
exports.default = CommentController;
