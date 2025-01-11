"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playlist_1 = __importDefault(require("../models/playlist"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const http_errors_1 = __importDefault(require("http-errors"));
const create = async (req, res, next) => {
    const user = req.user;
    const { title, podcasts } = req.body;
    let error, playlist;
    [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findOne({ title: title }));
    if (error)
        return next(error);
    console.log(playlist);
    if (playlist)
        return next((0, http_errors_1.default)(http_status_1.default.CONFLICT, "Playlists already exists"));
    if (!playlist) {
        [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.create({
            user: user.userId,
            title: title,
            podcasts: podcasts || [],
        }));
        if (error)
            return next(error);
        // for (const podcast of podcasts) {
        //     await addNotification(podcast, user.userId, Subject.PLAYLIST);
        // }
        return res
            .status(http_status_1.default.CREATED)
            .json({ success: true, message: "Success", data: playlist });
    }
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const userId = req.user.userId;
    const [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findOne({ user: userId, _id: id }).lean());
    if (error)
        return next(error);
    if (!playlist)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Playlist Not Found"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: playlist });
};
const getAll = async (req, res, next) => {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [countError, totalPlaylists] = await (0, await_to_ts_1.default)(playlist_1.default.countDocuments({ user: userId }));
    if (countError)
        return next(countError);
    const [fetchError, playlists] = await (0, await_to_ts_1.default)(playlist_1.default.find({ user: userId })
        .populate({ path: "podcasts", select: "cover" })
        .skip(skip)
        .limit(Number(limit))
        .lean());
    if (fetchError)
        return next(fetchError);
    if (!playlists || playlists.length === 0) {
        return res.status(http_status_1.default.OK).json({
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
    const processedPlaylists = playlists.map((playlist) => ({
        _id: playlist._id,
        title: playlist.title,
        cover: playlist.podcasts[0]?.cover || null,
        total: playlist.podcasts.length,
    }));
    res.status(http_status_1.default.OK).json({
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
const update = async (req, res, next) => {
    const { id } = req.params;
    const { title } = req.body;
    const [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findByIdAndUpdate(id, { $set: { title: title } }, { new: true }).lean());
    if (error)
        return next(error);
    if (!playlist)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Playlist Not Found"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: playlist });
};
const remove = async (req, res, next) => {
    const { id } = req.params;
    const [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    if (!playlist)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Playlist Not Found"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: {} });
};
const addPodcast = async (req, res, next) => {
    const user = req.user;
    const id = req.params.id;
    const { podcasts } = req.body;
    if (!Array.isArray(podcasts) || podcasts.length === 0) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid podcasts list"));
    }
    let error, playlist;
    [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findOne({ _id: id, user: user.userId }));
    if (error)
        return next(error);
    if (!playlist)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Playlist Not Found"));
    // Ensure podcasts are unique within the playlist
    const existingPodcastIds = new Set(playlist.podcasts.map((p) => p.toString()));
    const newPodcasts = podcasts.filter((p) => !existingPodcastIds.has(p));
    // Add unique podcasts to the playlist
    playlist.podcasts.push(...newPodcasts);
    [error] = await (0, await_to_ts_1.default)(playlist.save());
    if (error)
        return next(error);
    // Notify for new podcasts
    // for (const podcast of newPodcasts) {
    //     await addNotification(podcast, user.userId, Subject.PLAYLIST);
    // }
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: playlist,
    });
};
const getPodcast = async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (page <= 0 || limit <= 0) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    }
    const id = req.params.id;
    const userId = req.user.userId;
    let error, playlist;
    [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findOne({ user: userId, _id: id })
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
    if (!playlist)
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "Playlist not found", data: [] });
    if (!playlist.podcasts || playlist.podcasts.length === 0) {
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No Podcasts Found!", data: [] });
    }
    const totalPodcasts = playlist.podcasts.length;
    const paginatedPodcasts = playlist.podcasts.slice((page - 1) * limit, page * limit);
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
const removePodcast = async (req, res, next) => {
    const user = req.user;
    const id = req.params.id;
    const { podcastId } = req.body;
    let error, playlist;
    [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findOne({ _id: id, user: user.userId }));
    if (error)
        return next(error);
    if (!playlist)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Playlist Not Found"));
    [error, playlist] = await (0, await_to_ts_1.default)(playlist_1.default.findByIdAndUpdate(id, { $pull: { podcasts: podcastId } }, { new: true }));
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: playlist });
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
exports.default = PlaylistController;
