import Playlist from "@models/playlist";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import httpStatus from "http-status";
import createError from "http-errors";

const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const user = req.user;
  const { title, podcasts } = req.body;
  const [error, playlist] = await to(
    Playlist.create({
      user: user.userId,
      title: title,
      podcasts: podcasts || [],
    }),
  );
  if (error) return next(error);
  res
    .status(httpStatus.CREATED)
    .json({ message: "Success", data: playlist });
};

const get = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const id = req.params.id;
  const userId = req.user.userId;
  const [error, playlist] = await to(
    Playlist.findOne({ user: userId, _id: id }).lean(),
  );
  if (error) return next(error);
  if (!playlist)
    return next(
      createError(
        httpStatus.NOT_FOUND,
        "Playlist Not Found",
      ),
    );
  res
    .status(httpStatus.OK)
    .json({ message: "Success", data: playlist });
};

const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const userId = req.user.userId;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [error, playlists] = await to(
    Playlist.find({ user: userId })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  );

  if (error) return next(error);
  if (!playlists || playlists.length === 0) {
    return next(
      createError(
        httpStatus.NOT_FOUND,
        "Playlists Not Found",
      ),
    );
  }

  const [countError, totalPlaylists] = await to(
    Playlist.countDocuments({ user: userId }),
  );
  if (countError) return next(countError);

  res.status(httpStatus.OK).json({
    message: "Success",
    data: playlists,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalPlaylists / Number(limit)),
      totalResults: totalPlaylists,
      limit: Number(limit),
    },
  });
};

const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { id } = req.params;
  const { title } = req.body;
  const [error, playlist] = await to(
    Playlist.findByIdAndUpdate(
      id,
      { $set: { title: title } },
      { new: true },
    ).lean(),
  );
  if (error) return next(error);
  if (!playlist)
    return next(
      createError(
        httpStatus.NOT_FOUND,
        "Playlist Not Found",
      ),
    );
  res
    .status(httpStatus.OK)
    .json({ message: "Success", data: playlist });
};

const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { id } = req.params;
  const [error, playlist] = await to(
    Playlist.findByIdAndDelete(id),
  );
  if (error) return next(error);
  if (!playlist)
    return next(
      createError(
        httpStatus.NOT_FOUND,
        "Playlist Not Found",
      ),
    );
  res.status(httpStatus.OK).json({ message: "Success" });
};

// const addPodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//   const user = req.user;
//   const { playlistId, podcastId } = req.body;
//   let error, playlist, podcast;
//   [error, playlist] = await to(Playlist.findOne({ _id: playlistId, user: user.userId }));
//   if (error) return next(error);
//   if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
//
//   [error, podcast] = await to(Podcast.findById(podcastId));
//   if (error) return next(error);
//   if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));
//
//   playlist.podcasts.push(podcastId);
//   [error, playlist] = await to(playlist.save());
//   if (error) return next(error);
//
//   await addNotification(podcastId, user.userId, Subject.PLAYLIST);
//   return res.status(httpStatus.OK).json({ message: "Success", playlist });
// };

const getPodcast = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { id } = req.params;
  const user = req.user;
  const [error, playlist] = await to(
    Playlist.findOne({
      _id: id,
      user: user.userId,
    }).populate({
      path: "podcasts",
      select: "creator cover title",
      populate: {
        path: "creator",
        select: "user -_id",
        populate: { path: "user", select: "name -_id" },
      },
    }),
  );
  if (error) return next(error);
  if (!playlist)
    return next(
      createError(
        httpStatus.NOT_FOUND,
        "Playlist Not Found",
      ),
    );
  return res
    .status(httpStatus.OK)
    .json({ message: "Success", data: playlist.podcasts });
};

// const removePodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//   const user = req.user;
//   const { playlistId, podcastId } = req.body;
//   let error, playlist, podcast;
//   [error, playlist] = await to(Playlist.findOne({ _id: playlistId, user: user.userId }));
//   if (error) return next(error);
//   if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
//
//   [error, podcast] = await to(Podcast.findById(podcastId));
//   if (error) return next(error);
//   if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));
//
//   [error, playlist] = await to(
//     Playlist.findByIdAndUpdate(playlistId, { $pull: { podcasts: podcastId } }, { new: true }),
//   );
//   if (error) return next(error);
//
//   return res.status(httpStatus.OK).json({ message: "Success", data: playlist });
// };

const PlaylistController = {
  create,
  get,
  getAll,
  update,
  remove,
  getPodcast,
};

export default PlaylistController;
