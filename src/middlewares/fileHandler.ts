import Cloudinary from "@shared/cloudinary";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import createError from "http-errors";
import httpStatus from "http-status";

const uploadFileToCloudinary = async (
  file: UploadedFile,
  folder: string
): Promise<string> => {
  try {
    return await Cloudinary.upload(file, folder);
  } catch (error: any) {
    throw new Error(`Failed to upload ${folder} file: ${error.message}`);
  }
};

export const fileHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fileFields = [
      { fieldName: "avatar", folder: "profile", key: "avatarUrl" },
      { fieldName: "categoryImage", folder: "category", key: "categoryImageUrl" },
      { fieldName: "subcategoryImage", folder: "subcategory", key: "subcategoryImageUrl" },
      { fieldName: "cover", folder: "cover", key: "coverUrl" },
      { fieldName: "audio", folder: "audio", key: "podcastAudioUrl" },
    ];

    if (req.files) {
      await Promise.all(
        fileFields.map(async ({ fieldName, folder, key }) => {
          const file = req.files[fieldName] as UploadedFile | undefined;
          if (file) {
            const fileUrl = await uploadFileToCloudinary(file, folder);
            req.body[key] = fileUrl;
          }
        })
      );
    }

    next();
  } catch (error: any) {
    next(createError(httpStatus.BAD_REQUEST, error.message));
  }
};

export default fileHandler;
