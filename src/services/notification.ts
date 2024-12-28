import { Subject } from "@shared/enums";
import { Types } from "mongoose";

import Like from "@models/like";
import Comment from "@models/comment";
import Podcast from "@models/podcast";
import User from "@models/user";

import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import httpStatus from "http-status";

export type NotificationMetadata = {
  podcast?: Types.ObjectId;
  podcastTitle?: string;
  creatorName?: string;
  userName?: string;
  planName?: string;
};

export const addNotification = async (
  subject: Subject,
  recipient: Types.ObjectId,
  metadata: NotificationMetadata,
) => {
  const target_user = await User.findById(recipient);
  let message, createdAt, updatedAt;

  if (subject === Subject.LIKE && metadata.podcast) {
    const podcast = await Podcast.findById(metadata.podcast);
    const like = await Like.find({ podcast: metadata.podcast._id });
    const userIds = like.map((like) => like.user._id);
    const users = await User.find({ _id: { $in: userIds } }, "name");

    if (users.length === 1) {
      message = `${users[0].name} liked your ${podcast?.title}`;
    } else if (users.length === 2) {
      message = `${users[0].name} and ${users[1].name} liked your ${podcast?.title}`;
    } else {
      message = `${users[0].name}, ${users[1].name} and ${users.length - 2} others liked your ${podcast?.title}`;
    }
    if (!target_user!.notification) {
      target_user!.notification = [];
      console.log(target_user?.notification);
    }
    const existingNotificationIdx = target_user?.notification.findIndex(
      (notif) => notif.subject === Subject.LIKE && notif.podcast?.equals(metadata.podcast),
    );
    console.log(existingNotificationIdx);

    const newNotification = {
      subject: Subject.LIKE,
      podcast: metadata.podcast,
      message,
      createdAt:
        existingNotificationIdx !== -1
          ? target_user!.notification[existingNotificationIdx!].createdAt
          : new Date(),
      updatedAt: new Date(),
    };

    console.log(newNotification);

    if (existingNotificationIdx !== -1) {
      target_user!.notification[existingNotificationIdx!] = newNotification;
    } else {
      target_user!.notification.push(newNotification);
    }

    console.log(target_user?.notification);

    try {
      await target_user!.save();
      console.log("Notification saved successfully:", target_user!.notification);
      console.log("User document after save:", await User.findById(target_user!._id));
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  } else if (subject === Subject.COMMENT && metadata.podcast) {
    const podcast = await Podcast.findById(metadata.podcast);
    const comment = await Comment.find({ podcast: metadata.podcast._id });
    const userIds = comment.map((comment) => comment.user._id);
    const users = await User.find({ _id: { $in: userIds } }, "name");

    if (users.length === 1) {
      message = `${users[0].name} commented on your ${podcast?.title}`;
    } else if (users.length === 2) {
      message = `${users[0].name} and ${users[1].name} commented on your ${podcast?.title}`;
    } else {
      message = `${users[0].name}, ${users[1].name} and ${users.length - 2} others commented on your ${podcast?.title}`;
    }

    if (!target_user!.notification) {
      target_user!.notification = [];
      console.log(target_user?.notification);
    }

    const existingNotificationIdx = target_user?.notification.findIndex(
      (notif) => notif.subject === Subject.COMMENT && notif.podcast === metadata.podcast,
    );

    const newNotification = {
      subject: Subject.COMMENT,
      podcast: metadata.podcast,
      message,
      createdAt:
        existingNotificationIdx !== -1
          ? target_user!.notification[existingNotificationIdx!].createdAt
          : new Date(),
      updatedAt: new Date(),
    };

    if (existingNotificationIdx !== -1) {
      target_user!.notification[existingNotificationIdx!] = newNotification;
    } else {
      target_user!.notification.push(newNotification);
    }

    await target_user!.save();
  } else if (subject === Subject.APPROVED) {
    message = "Your have been approved by the admin. Now you can upload podcast";
    createdAt = new Date();
    updatedAt = new Date();

    const newNotification = {
      subject: Subject.APPROVED,
      message,
      createdAt,
      updatedAt,
    };

    target_user!.notification.push(newNotification);

    await target_user!.save();
  } else if (subject === Subject.BLOCKED) {
    message = "Your account has been blocked by the admin";
    createdAt = new Date();
    updatedAt = new Date();

    const newNotification = {
      subject: Subject.BLOCKED,
      message,
      createdAt,
      updatedAt,
    };

    target_user!.notification.push(newNotification);

    await target_user!.save();
  } else if (subject === Subject.DELETED && metadata.podcastTitle) {
    message = `Your podcast, ${metadata.podcastTitle} has been deleted by the admin for violating terms and conditions`;
    createdAt = new Date();
    updatedAt = new Date();

    const newNotification = {
      subject: Subject.DELETED,
      message,
      createdAt,
      updatedAt,
    };

    target_user!.notification.push(newNotification);

    await target_user!.save();
  } else if (subject === Subject.REPORTED && metadata.podcastTitle && metadata.userName) {
    message = `A user, ${metadata.userName}, has reported a podcast, ${metadata.podcastTitle} uploaded by ${metadata.creatorName}`;
    createdAt = new Date();
    updatedAt = new Date();
    const newNotification = {
      subject: Subject.REPORTED,
      message,
      createdAt,
      updatedAt,
    };

    target_user!.notification.push(newNotification);

    await target_user!.save();
  }
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const [error, user] = await to(User.findById(userId));
  if (error) return next(error);

  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success", data: user?.notification });
};

const NotificationServices = {
  get,
};

export default NotificationServices;
