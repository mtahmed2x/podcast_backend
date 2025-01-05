import Cloudinary from "@shared/cloudinary";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

export const fileHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  if(req.files && req.files.avatar) {
    const avatar = req.files.avatar as UploadedFile;
    const avatarUrl = await Cloudinary.upload(avatar, "profile");
    req.body.avatarUrl = avatarUrl;
  }
  if(req.files && req.files.categoryImage) {
    const categoryImage = req.files.categoryImage as UploadedFile;
    const categoryImageUrl = await Cloudinary.upload(categoryImage, "category");
    req.body.categoryImageUrl = categoryImageUrl;
  }
  if(req.files && req.files.subcategoryImage) {
    const subcategoryImage = req.files.subcategoryImage as UploadedFile;
    const subcategoryImageUrl = await Cloudinary.upload(subcategoryImage, "subcategory");
    req.body.subcategoryImageUrl = subcategoryImageUrl;
  }
  if(req.files && req.files.coverImage) {
    const coverImage = req.files.cover as UploadedFile;
    const coverUrl = await Cloudinary.upload(coverImage, "cover");
    req.body.coverUrl = coverUrl; 
  }
  if(req.files && req.files.podcastAudio) {
    const podcastAudio = req.files.podcastAudio as UploadedFile;
    const podcastAudioUrl = await Cloudinary.upload(podcastAudio, "podcastAudio");
    req.body.podcastAudioUrl = podcastAudioUrl;
  }
  next();
};

export default fileHandler;
