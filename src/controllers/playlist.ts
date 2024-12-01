import Podcast from "@models/podcast";
import Playlist from "@models/playlist";
import { PlaylistSchema } from "@schemas/playlist";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { addNotification } from "@controllers/notification";
import { Subject } from "@shared/enums";
import httpStatus from "http-status";
import createError from "http-errors";

type Params = {
  id: string;
};

const create = async (
  req: Request<{}, {}, Partial<PlaylistSchema>>,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const user = req.user;
  const { title } = req.body;
  const [error, playlist] = await to(Playlist.create({ user: user.userId, title: title }));
  if (error) return next(error);
  res.status(httpStatus.CREATED).json({ message: "Success", data: playlist });
};

const get = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const userId = req.user.userId;
  const [error, playlist] = await to(Playlist.findOne({ user: userId, _id: id }).lean());
  if (error) return next(error);
  if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
  res.status(httpStatus.OK).json({ message: "Success", data: playlist });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const [error, playlists] = await to(Playlist.find({ user: userId }).lean());
  if (error) return next(error);
  if (!playlists) return next(createError(httpStatus.NOT_FOUND, "Playlists Not Found"));
  res.status(httpStatus.OK).json({ message: "Success", data: playlists });
};

const update = async (
  req: Request<Params, {}, Partial<PlaylistSchema>>,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { id } = req.params;
  const { title } = req.body;
  const [error, playlist] = await to(Playlist.findByIdAndUpdate(id, { $set: { title: title } }, { new: true }).lean());
  if (error) return next(error);
  if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
  res.status(httpStatus.OK).json({ message: "Success", data: playlist });
};

const remove = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  const [error, playlist] = await to(Playlist.findByIdAndDelete(id));
  if (error) return next(error);
  if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
  res.status(httpStatus.OK).json({ message: "Success" });
};

const addPodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { playlistId, podcastId } = req.body;
  let error, playlist, podcast;
  [error, playlist] = await to(Playlist.findOne({ _id: playlistId, user: user.userId }));
  if (error) return next(error);
  if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));

  [error, podcast] = await to(Podcast.findById(podcastId));
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

  playlist.podcasts.push(podcastId);
  [error, playlist] = await to(playlist.save());
  if (error) return next(error);

  await addNotification(podcastId, user.userId, Subject.PLAYLIST);
  return res.status(httpStatus.OK).json({ message: "Success", playlist });
};

const getPodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  const user = req.user;
  const [error, playlist] = await to(Playlist.findOne({ _id: id, user: user.userId }));
  if (error) return next(error);
  if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: playlist.podcasts });
};

const removePodcast = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { playlistId, podcastId } = req.body;
  let error, playlist, podcast;
  [error, playlist] = await to(Playlist.findOne({ _id: playlistId, user: user.userId }));
  if (error) return next(error);
  if (!playlist) return next(createError(httpStatus.NOT_FOUND, "Playlist Not Found"));

  [error, podcast] = await to(Podcast.findById(podcastId));
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));

  [error, playlist] = await to(
    Playlist.findByIdAndUpdate(playlistId, { $pull: { podcasts: podcastId } }, { new: true }),
  );
  if (error) return next(error);

  return res.status(httpStatus.OK).json({ message: "Success", data: playlist });
};

const PlaylistController = {
  create,
  get,
  getAll,
  update,
  remove,
  addPodcast,
  getPodcast,
  removePodcast,
};

export default PlaylistController;
