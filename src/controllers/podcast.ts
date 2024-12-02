import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import { getAudioMetadata, getImageMetadata } from "@utils/extractMetadata";
import path from "path";
import fs from "fs";

import Podcast from "@models/podcast";
import Category from "@models/category";
import SubCategory from "@models/subCategory";
import Creator from "@models/creator";

import mongoose from "mongoose";
import httpStatus from "http-status";
import createError from "http-errors";
import { addPodcast } from "@controllers/history";

type PodcastFiles = Express.Request & {
  files: { [fieldname: string]: Express.Multer.File[] };
};

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { categoryId, subCategoryId, title, description, location } = req.body;
  const { audio, cover } = (req as PodcastFiles).files;
  const creatorId = req.user.creatorId;

  let error, category, subCategory;

  [error, category] = await to(Category.findById(categoryId));
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));

  [error, subCategory] = await to(SubCategory.findById(subCategoryId));
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory Not Found"));

  const audio_path = audio[0].path;
  const cover_path = cover[0].path;

  const audioMetadata = await getAudioMetadata(audio_path);
  const imageMetadata = await getImageMetadata(cover_path);

  const session = await mongoose.startSession();
  session.startTransaction();
  let podcast;
  try {
    podcast = await Podcast.create({
      creator: creatorId,
      category: categoryId,
      subCategory: subCategoryId,
      title: title,
      description: description,
      location: location,
      cover: cover_path,
      coverFormat: imageMetadata.format,
      coverSize: imageMetadata.size,
      audio: audio_path,
      audioFormat: audioMetadata.format,
      audioSize: audioMetadata.size,
      audioDuration: audioMetadata.duration,
    });
    await Creator.findByIdAndUpdate(creatorId, { $push: { podcasts: podcast._id } });
    await SubCategory.findByIdAndUpdate(subCategoryId, { $push: { podcasts: podcast._id } });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      await session.endSession();
    }
    return next(error);
  } finally {
    await session.endSession();
  }

  return res.status(httpStatus.CREATED).json({ message: "Success", data: podcast });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  const [error, podcast] = await to(
    Podcast.findById(id)
      .populate({
        path: "creator",
        select: "user -_id",
        populate: {
          path: "user",
          select: "name -_id",
        },
      })
      .populate({
        path: "category",
        select: "title",
      })
      .populate({
        path: "subCategory",
        select: "title",
      })
      .lean(),
  );
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));
  return res.status(httpStatus.OK).json({ message: "Success", data: podcast });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0) {
    return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
  }

  const [error, podcasts] = await to(
    Podcast.find()
      .populate({
        path: "creator",
        select: "user -_id",
        populate: {
          path: "user",
          select: "name -_id",
        },
      })
      .populate({
        path: "category",
        select: "title",
      })
      .populate({
        path: "subCategory",
        select: "title",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  );
  if (error) return next(error);
  if (!podcasts || podcasts.length === 0) {
    return next(createError(httpStatus.NOT_FOUND, "No podcasts found"));
  }

  return res.status(httpStatus.OK).json({
    message: "Success",
    data: podcasts,
    pagination: {
      page,
      limit,
      total: await Podcast.countDocuments(),
    },
  });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { categoryId, subCategoryId, title, description, location } = req.body;
  const { cover } = (req as PodcastFiles).files;
  let error, podcast;
  const { id } = req.params;

  const updateFields: {
    category?: string;
    subCategory?: string;
    title?: string;
    description?: string;
    location?: string;
    cover?: string;
  } = {};

  if (categoryId) {
    let category;
    [error, category] = await to(Category.findById(categoryId));
    if (error) return next(error);
    if (!category) return next(createError(httpStatus.NOT_FOUND, "Category not found!"));
    updateFields.category = categoryId;
  }
  if (subCategoryId) {
    let subCategory;
    [error, subCategory] = await to(SubCategory.findById(subCategoryId));
    if (error) return next(error);
    if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "subCategory not found!"));
    updateFields.subCategory = subCategoryId;
  }
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (location) updateFields.location = location;
  if (cover) updateFields.cover = cover[0].path;

  [error, podcast] = await to(Podcast.findByIdAndUpdate(id, { $set: updateFields }, { new: true }));
  if (error) return next(error);
  res.status(httpStatus.OK).json({ message: "Success", data: podcast });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  let error, podcast;
  const { id } = req.params;
  [error, podcast] = await to(Podcast.findById(id));
  if (error) return next(error);
  if (!podcast) return res.status(400).json({ error: "Podcast Not Found" });

  const coverPath = path.resolve(podcast.cover!);
  const audioPath = path.resolve(podcast.audio);

  fs.unlink(coverPath, (err) => {
    if (err) {
      console.error("Failed to delete file:", err);
      return res.status(500).json({ error: "Failed to delete file from storage" });
    }
  });
  fs.unlink(audioPath, (err) => {
    if (err) {
      console.error("Failed to delete file:", err);
      return res.status(500).json({ error: "Failed to delete file from storage" });
    }
  });
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await Creator.findByIdAndUpdate(podcast.creator, { $pull: { podcasts: id } });
    await SubCategory.findByIdAndUpdate(podcast.subCategory, { $pull: { podcasts: id } });
    await Podcast.findByIdAndDelete(id);

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      await session.endSession();
    }
    return next(error);
  }

  res.status(httpStatus.OK).json({ message: "Success" });
};

export const updateLikeCount = async (podcastId: string, value: number): Promise<number> => {
  const podcast = await Podcast.findByIdAndUpdate(podcastId, { $inc: { totalLikes: value } }, { new: true });
  return podcast!.totalLikes;
};

export const updateCommentCount = async (podcastId: string): Promise<void> => {
  const [error, podcast] = await to(
    Podcast.findByIdAndUpdate(podcastId, { $inc: { totalComments: 1 } }, { new: true }),
  );
  if (error) console.error(error);
  if (!podcast) console.error("Failed to update podcast comment count");
};

const fetchPodcastsSorted = async (
  sortField: string,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const [error, podcasts] = await to(
    Podcast.find()
      .populate({
        path: "creator",
        select: "user",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .sort({ [sortField]: -1 })
      .lean(),
  );
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ message: "Success", data: podcasts });
};

export const mostLiked = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  return await fetchPodcastsSorted("totalLikes", req, res, next);
};

export const mostCommented = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  return await fetchPodcastsSorted("totalComments", req, res, next);
};

export const mostFavorited = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  return await fetchPodcastsSorted("totalFavorites", req, res, next);
};

export const mostViewed = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  return await fetchPodcastsSorted("totalViews", req, res, next);
};

const play = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const id = req.params.id;
  const [error, podcast] = await to(Podcast.findById(id).lean());
  if (error) return next(error);
  if (!podcast) return next(createError(httpStatus.NOT_FOUND, "Podcast Not Found"));
  await addPodcast(user.userId, podcast._id.toString());
  podcast.totalViews += 1;
  await podcast.save();
  return res.status(httpStatus.OK).json({ message: "Success", data: podcast.audio });
};

const PodcastController = {
  create,
  getAll,
  get,
  update,
  remove,
  mostLiked,
  mostCommented,
  mostFavorited,
  mostViewed,
  play,
};

export default PodcastController;
