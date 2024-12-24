import Comment from "@models/comment";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import { updateCommentCount, updateLikeCount } from "@controllers/podcast";
// import { addNotification, removeLikeNotification } from "@controllers/notification";
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

    [error, comment] = await to(
        Comment.create({
            user: user.userId,
            podcast: id,
            text: text,
        }),
    );
    if (error) return next(error);

    await updateCommentCount(id);
    // await addNotification(id, user.userId, Subject.COMMENT);

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Success",
        data: comment,
    });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let error, podcast, comments, totalComments;
    [error, podcast] = await to(Podcast.findById(id));
    if (error) return next(error);
    if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

    [error, totalComments] = await to(Comment.countDocuments({ podcast: id }));
    if (error) return next(error);

    [error, comments] = await to(
        Comment.find({ podcast: id })
            .select("user text")
            .populate({
                path: "user",
                select: "avatar name",
            })
            .skip(skip)
            .limit(limit),
    );
    if (error) return next(error);
    if (!comments)
        return res.status(httpStatus.OK).json({ success: true, message: "Success", data: [] });

    const defaultAvatar = "uploads/default/default-avatar.png";
    comments = comments.map((comment: any) => {
        if (comment.user?.avatar == null) {
            comment.user.avatar = defaultAvatar;
        }
        return comment;
    });

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Success",
        data: { comments, currentPage: page, limit },
    });
};

const CommentController = {
    addComment,
    get,
};

export default CommentController;
