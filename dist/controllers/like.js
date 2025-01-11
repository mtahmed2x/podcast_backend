"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const like_1 = __importDefault(require("../models/like"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const podcast_1 = require("./podcast");
// import { addNotification, removeLikeNotification } from "./notification";
const enums_1 = require("../shared/enums");
const podcast_2 = __importDefault(require("../models/podcast"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const notification_1 = require("../services/notification");
const creator_1 = __importDefault(require("../models/creator"));
const likeToggle = async (req, res, next) => {
    const user = req.user;
    const id = req.params.id;
    let error, podcast, like, value;
    [error, podcast] = await (0, await_to_ts_1.default)(podcast_2.default.findById(id));
    if (error)
        return next(error);
    if (!podcast)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Podcast Not Found"));
    [error, like] = await (0, await_to_ts_1.default)(like_1.default.findOne({ user: user.userId, podcast: id }));
    if (error)
        return next(error);
    if (!like) {
        [error] = await (0, await_to_ts_1.default)(like_1.default.create({ user: user.userId, podcast: id }));
        if (error)
            return next(error);
        value = 1;
        await (0, podcast_1.updateLikeCount)(id, value);
    }
    else {
        [error] = await (0, await_to_ts_1.default)(like_1.default.findByIdAndDelete(like._id));
        if (error)
            return next(error);
        value = -1;
        await (0, podcast_1.updateLikeCount)(id, value);
    }
    const creator = await creator_1.default.findById(podcast.creator);
    if (creator?.user) {
        if (value === 1)
            await (0, notification_1.addNotification)(enums_1.Subject.LIKE, creator.user, { podcast: podcast._id });
    }
    // if (value == 1) await addNotification(id, user.userId, Subject.LIKE);
    // if (value == -1) await removeLikeNotification(id, user.userId);
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success", data: { like: value === 1 } });
};
const LikeController = {
    likeToggle,
};
exports.default = LikeController;
