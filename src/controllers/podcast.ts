import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import { getAudioMetadata, getImageMetadata } from "@utils/extractMetadata";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

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

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { categoryId, subCategoryId, title, description, location } = req.body;
  const { audio, cover } = (req as any).files; // Assuming `files` is populated by multer middleware
  const creatorId = req.user.creatorId;

  let error, category, subCategory;

  // Validate Category
  [error, category] = await to(Category.findById(categoryId));
  if (error) return next(error);
  if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));

  // Validate SubCategory
  [error, subCategory] = await to(SubCategory.findById(subCategoryId));
  if (error) return next(error);
  if (!subCategory) return next(createError(httpStatus.NOT_FOUND, "SubCategory Not Found"));

  const audioLocalPath = audio[0].path; // Local path of the uploaded audio
  const coverPath = cover[0].path;

  let audioCloudinaryUrl: string;

  try {
    // Upload audio to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(audioLocalPath, {
      resource_type: "video", // Cloudinary treats audio as "video"
      folder: "uploads/podcast/audio",
    });
    audioCloudinaryUrl = cloudinaryResponse.secure_url; // Secure URL for playback
  } catch (uploadError) {
    console.error("Cloudinary upload error:", uploadError);
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "Audio upload to Cloudinary failed"));
  }

  // Extract metadata for audio and cover
  const audioMetadata = await getAudioMetadata(audioCloudinaryUrl);
  const imageMetadata = await getImageMetadata(coverPath);

  // Start a transaction for database operations
  const session = await mongoose.startSession();
  session.startTransaction();
  let podcast;
  try {
    podcast = await Podcast.create({
      creator: creatorId,
      category: categoryId,
      subCategory: subCategoryId,
      title,
      description,
      location,
      cover: coverPath,
      coverFormat: imageMetadata.format,
      coverSize: imageMetadata.size,
      audio: audioCloudinaryUrl,
      audioFormat: audioMetadata.format,
      audioSize: audioMetadata.size,
      audioDuration: audioMetadata.duration,
    });

    // Update Creator and SubCategory documents
    await Creator.findByIdAndUpdate(creatorId, { $push: { podcasts: podcast._id } });
    await SubCategory.findByIdAndUpdate(subCategoryId, { $push: { podcasts: podcast._id } });

    await session.commitTransaction(); // Commit the transaction
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction(); // Rollback transaction on error
    }
    return next(error);
  } finally {
    session.endSession();
  }

  return res.status(httpStatus.CREATED).json({ success: true, message: "Podcast created successfully", data: podcast });
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
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcast });
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
    return res.status(httpStatus.OK).json({
      success: true,
      message: "No Podcast Found!",
      data: podcasts,
      pagination: {
        page,
        limit,
        total: await Podcast.countDocuments(),
      },
    });
  }

  return res.status(httpStatus.OK).json({
    success: true,
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
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcast });
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

  res.status(httpStatus.OK).json({ success: true, message: "Success" });
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

export const fetchPodcastsSorted = async (sortField: string, limit?: number): Promise<any> => {
  const query = Podcast.find()
    .populate({
      path: "creator",
      select: "user",
      populate: {
        path: "user",
        select: "name",
      },
    })
    .sort({ [sortField]: -1 })
    .lean();

  // if (limit) query.limit(limit);

  const [error, podcasts] = await to(query);
  if (error) throw error;
  return podcasts;
};

export const mostLiked = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, podcasts] = await to(fetchPodcastsSorted("totalLikes"));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
};

export const mostCommented = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, podcasts] = await to(fetchPodcastsSorted("totalComments"));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
};

export const mostFavorited = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, podcasts] = await to(fetchPodcastsSorted("totalFavorites"));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
};

export const mostViewed = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, podcasts] = await to(fetchPodcastsSorted("totalViews"));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
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
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcast.audio });
};

const PodcastController = {
  create,
  get,
  getAll,
  update,
  remove,
  mostLiked,
  mostCommented,
  mostFavorited,
  mostViewed,
  play,
};

export default PodcastController;
