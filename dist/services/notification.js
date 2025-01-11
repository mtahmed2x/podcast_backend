"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNotification = void 0;
const enums_1 = require("../shared/enums");
const like_1 = __importDefault(require("../models/like"));
const comment_1 = __importDefault(require("../models/comment"));
const podcast_1 = __importDefault(require("../models/podcast"));
const user_1 = __importDefault(require("../models/user"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const addNotification = async (subject, recipient, metadata) => {
    const target_user = await user_1.default.findById(recipient);
    let message, createdAt, updatedAt;
    if (subject === enums_1.Subject.LIKE && metadata.podcast) {
        const podcast = await podcast_1.default.findById(metadata.podcast);
        const like = await like_1.default.find({ podcast: metadata.podcast._id });
        const userIds = like.map((like) => like.user._id);
        const users = await user_1.default.find({ _id: { $in: userIds } }, "name");
        if (users.length === 1) {
            message = `${users[0].name} liked your ${podcast?.title}`;
        }
        else if (users.length === 2) {
            message = `${users[0].name} and ${users[1].name} liked your ${podcast?.title}`;
        }
        else {
            message = `${users[0].name}, ${users[1].name} and ${users.length - 2} others liked your ${podcast?.title}`;
        }
        if (!target_user.notification) {
            target_user.notification = [];
            console.log(target_user?.notification);
        }
        const existingNotificationIdx = target_user?.notification.findIndex((notif) => notif.subject === enums_1.Subject.LIKE && notif.podcast?.equals(metadata.podcast));
        console.log(existingNotificationIdx);
        const newNotification = {
            subject: enums_1.Subject.LIKE,
            podcast: metadata.podcast,
            message,
            createdAt: existingNotificationIdx !== -1
                ? target_user.notification[existingNotificationIdx].createdAt
                : new Date(),
            updatedAt: new Date(),
        };
        console.log(newNotification);
        if (existingNotificationIdx !== -1) {
            target_user.notification[existingNotificationIdx] = newNotification;
        }
        else {
            target_user.notification.push(newNotification);
        }
        console.log(target_user?.notification);
        try {
            await target_user.save();
            console.log("Notification saved successfully:", target_user.notification);
            console.log("User document after save:", await user_1.default.findById(target_user._id));
        }
        catch (error) {
            console.error("Error saving notification:", error);
        }
    }
    else if (subject === enums_1.Subject.COMMENT && metadata.podcast) {
        const podcast = await podcast_1.default.findById(metadata.podcast);
        const comment = await comment_1.default.find({ podcast: metadata.podcast._id });
        const userIds = comment.map((comment) => comment.user._id);
        const users = await user_1.default.find({ _id: { $in: userIds } }, "name");
        if (users.length === 1) {
            message = `${users[0].name} commented on your ${podcast?.title}`;
        }
        else if (users.length === 2) {
            message = `${users[0].name} and ${users[1].name} commented on your ${podcast?.title}`;
        }
        else {
            message = `${users[0].name}, ${users[1].name} and ${users.length - 2} others commented on your ${podcast?.title}`;
        }
        if (!target_user.notification) {
            target_user.notification = [];
            console.log(target_user?.notification);
        }
        const existingNotificationIdx = target_user?.notification.findIndex((notif) => notif.subject === enums_1.Subject.COMMENT && notif.podcast === metadata.podcast);
        const newNotification = {
            subject: enums_1.Subject.COMMENT,
            podcast: metadata.podcast,
            message,
            createdAt: existingNotificationIdx !== -1
                ? target_user.notification[existingNotificationIdx].createdAt
                : new Date(),
            updatedAt: new Date(),
        };
        if (existingNotificationIdx !== -1) {
            target_user.notification[existingNotificationIdx] = newNotification;
        }
        else {
            target_user.notification.push(newNotification);
        }
        await target_user.save();
    }
    else if (subject === enums_1.Subject.APPROVED) {
        message = "Your have been approved by the admin. Now you can upload podcast";
        createdAt = new Date();
        updatedAt = new Date();
        const newNotification = {
            subject: enums_1.Subject.APPROVED,
            message,
            createdAt,
            updatedAt,
        };
        target_user.notification.push(newNotification);
        await target_user.save();
    }
    else if (subject === enums_1.Subject.BLOCKED) {
        message = "Your account has been blocked by the admin";
        createdAt = new Date();
        updatedAt = new Date();
        const newNotification = {
            subject: enums_1.Subject.BLOCKED,
            message,
            createdAt,
            updatedAt,
        };
        target_user.notification.push(newNotification);
        await target_user.save();
    }
    else if (subject === enums_1.Subject.DELETED && metadata.podcastTitle) {
        message = `Your podcast, ${metadata.podcastTitle} has been deleted by the admin for violating terms and conditions`;
        createdAt = new Date();
        updatedAt = new Date();
        const newNotification = {
            subject: enums_1.Subject.DELETED,
            message,
            createdAt,
            updatedAt,
        };
        target_user.notification.push(newNotification);
        await target_user.save();
    }
    else if (subject === enums_1.Subject.REPORTED && metadata.podcastTitle && metadata.userName) {
        message = `A user, ${metadata.userName}, has reported a podcast, ${metadata.podcastTitle} uploaded by ${metadata.creatorName}`;
        createdAt = new Date();
        updatedAt = new Date();
        const newNotification = {
            subject: enums_1.Subject.REPORTED,
            message,
            createdAt,
            updatedAt,
        };
        target_user.notification.push(newNotification);
        await target_user.save();
    }
};
exports.addNotification = addNotification;
const get = async (req, res, next) => {
    const userId = req.user.userId;
    const [error, user] = await (0, await_to_ts_1.default)(user_1.default.findById(userId));
    if (error)
        return next(error);
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success", data: user?.notification });
};
const NotificationServices = {
    get,
};
exports.default = NotificationServices;
