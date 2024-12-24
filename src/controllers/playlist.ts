import Playlist from "@models/playlist";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import httpStatus from "http-status";
import createError from "http-errors";
// import { addNotification } from "./notification";
import { Subject } from "@shared/enums";
import Podcast from "@models/podcast";
import { PlaylistSchema } from "@schemas/playlist";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const { title, podcasts } = req.body;
    let error, playlist;
    [error, playlist] = await to(Playlist.findOne({ title: title }));
    if (error) return next(error);
    console.log(playlist);
    if (playlist) return next(createError(httpStatus.CONFLICT, "Playlists already exists"));
    if (!playlist) {
        [error, playlist] = await to(
            Playlist.create({
                user: user.userId,
                title: title,
                podcasts: podcasts || [],
            }),
        );
        if (error) return next(error);
        // for (const podcast of podcasts) {
        //     await addNotification(podcast, user.userId, Subject.PLAYLIST);
        // }
        return res
            .status(httpStatus.CREATED)
            .json({ success: true, message: "Success", data: playlist });
    }
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const userId = req.user.userId;
    const [error, playlist] = await to(Playlist.findOne({ user: userId, _id: id }).lean());
    if (error) return next(error);
    if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
    res.status(httpStatus.OK).json({ success: true, message: "Success", data: playlist });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [countError, totalPlaylists] = await to(Playlist.countDocuments({ user: userId }));
    if (countError) return next(countError);

    const [fetchError, playlists] = await to(
        Playlist.find({ user: userId })
            .populate({ path: "podcasts", select: "cover" })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
    );

    if (fetchError) return next(fetchError);

    if (!playlists || playlists.length === 0) {
        return res.status(httpStatus.OK).json({
            success: true,
            message: "No Playlist Found",
            data: { playlists: [] },
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalPlaylists / Number(limit)),
                limit: Number(limit),
                totalResults: totalPlaylists,
            },
        });
    }

    const processedPlaylists = playlists.map((playlist: any) => ({
        _id: playlist._id,
        title: playlist.title,
        cover: playlist.podcasts[0]?.cover || null,
        total: playlist.podcasts.length,
    }));

    res.status(httpStatus.OK).json({
        success: true,
        message: "Success",
        data: {
            playlists: processedPlaylists,
        },
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalPlaylists / Number(limit)),
            limit: Number(limit),
            totalResults: totalPlaylists,
        },
    });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { title } = req.body;
    const [error, playlist] = await to(
        Playlist.findByIdAndUpdate(id, { $set: { title: title } }, { new: true }).lean(),
    );
    if (error) return next(error);
    if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
    res.status(httpStatus.OK).json({ success: true, message: "Success", data: playlist });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const [error, playlist] = await to(Playlist.findByIdAndDelete(id));
    if (error) return next(error);
    if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
    res.status(httpStatus.OK).json({ success: true, message: "Success", data: {} });
};

const addPodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const id = req.params.id;
    const { podcasts } = req.body;

    if (!Array.isArray(podcasts) || podcasts.length === 0) {
        return next(createError(httpStatus.BAD_REQUEST, "Invalid podcasts list"));
    }

    let error, playlist;
    [error, playlist] = await to(Playlist.findOne({ _id: id, user: user.userId }));
    if (error) return next(error);
    if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));

    // Ensure podcasts are unique within the playlist
    const existingPodcastIds = new Set(playlist.podcasts.map((p: any) => p.toString()));
    const newPodcasts = podcasts.filter((p: string) => !existingPodcastIds.has(p));

    // Add unique podcasts to the playlist
    playlist.podcasts.push(...newPodcasts);

    [error] = await to(playlist.save());
    if (error) return next(error);

    // Notify for new podcasts
    // for (const podcast of newPodcasts) {
    //     await addNotification(podcast, user.userId, Subject.PLAYLIST);
    // }

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Success",
        data: playlist,
    });
};

const getPodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page <= 0 || limit <= 0) {
        return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
    }

    const id = req.params.id;
    const userId = req.user.userId;

    let error, playlist;
    [error, playlist] = await to(
        Playlist.findOne({ user: userId, _id: id })
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
            .lean(),
    );

    if (error) return next(error);
    if (!playlist)
        return res
            .status(httpStatus.OK)
            .json({ success: true, message: "Playlist not found", data: [] });

    if (!playlist.podcasts || playlist.podcasts.length === 0) {
        return res
            .status(httpStatus.OK)
            .json({ success: true, message: "No Podcasts Found!", data: [] });
    }

    const totalPodcasts = playlist.podcasts.length;
    const paginatedPodcasts = playlist.podcasts.slice((page - 1) * limit, page * limit);

    const formattedPodcasts = paginatedPodcasts.map((podcast: any) => ({
        ...podcast,
        audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
    }));

    return res.status(httpStatus.OK).json({
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

const removePodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const id = req.params.id;
    const { podcastId } = req.body;
    let error, playlist;
    [error, playlist] = await to(Playlist.findOne({ _id: id, user: user.userId }));
    if (error) return next(error);
    if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));

    [error, playlist] = await to(
        Playlist.findByIdAndUpdate(id, { $pull: { podcasts: podcastId } }, { new: true }),
    );
    if (error) return next(error);

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: playlist });
};

const PlaylistController = {
    create,
    get,
    getAll,
    update,
    remove,
    getPodcast,
    addPodcast,
    removePodcast,
};

export default PlaylistController;
