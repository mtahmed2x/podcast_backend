import Comment from "@models/comment";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { updateCommentCount, updateLikeCount } from "@controllers/podcast";
import { addNotification, removeLikeNotification } from "@controllers/notification";
import { Subject } from "@shared/enums";
import Podcast from "@models/podcast";
import createError from "http-errors";
import httpStatus from "http-status";
import { populate } from "dotenv";

const addComment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const id = req.params.id;
    const { text } = req.body;

    let error, podcast, comment;
    [error, podcast] = await to(Podcast.findById(id));
    if (error) return next(error);
    if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

    [error, comment] = await to(Comment.findOne({ user: user.userId, podcast: id }));
    if (error) return next(error);
    if (!comment) {
        [error, comment] = await to(Comment.create({ user: user.userId, podcast: id, text: text }));
        if (error) return next(error);
    } else {
        comment.text.push(text);
        await comment.save();
    }
    await updateCommentCount(id);
    await addNotification(id, user.userId, Subject.COMMENT);

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: comment });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;

    let error, podcast, comments;
    [error, podcast] = await to(Podcast.findById(id));
    if (error) return next(error);
    if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

    [error, comments] = await to(
        Comment.find({ podcast: id }).populate({
            path: "user",
            select: "avatar name",
        }),
    );
    if (error) return next(error);
    if (!comments) return res.status(httpStatus.OK).json({ success: true, message: "Success", data: [] });

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: comments });
};

const CommentController = {
    addComment,
    get,
};

export default CommentController;
