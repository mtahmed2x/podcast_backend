import multer, { StorageEngine, FileFilterCallback } from "multer";
import fs from "fs";
import { Request } from "express";

export const uploadFile = () => {
  const storage: StorageEngine = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      let uploadPath = "";
      if (file.fieldname === "audio") {
        uploadPath = "uploads/podcast/audio";
      } else if (file.fieldname === "coverPhoto") {
        uploadPath = "uploads/podcast/coverPhoto";
      }

      try {
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      } catch (err) {
        cb(new Error("Could not create upload directory"), "");
      }
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      const name = `${Date.now()}-${file.originalname}`;
      cb(null, name);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedFieldnames = ["audio", "coverPhoto"];
    const allowedMimeTypes = [
      "audio/mpeg",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (allowedFieldnames.includes(file.fieldname)) {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
  }).fields([
    { name: "coverPhoto", maxCount: 5 },
    { name: "audio", maxCount: 10 },
  ]);

  return upload;
};
