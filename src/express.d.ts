import { Request } from "express";
import { Types } from "mongoose";
import { CategoryDocument } from "@models/category";
import { SubCategoryDocument } from "@models/subCategory";
import { DecodedUser } from "./schemas/schem";

declare global {
  namespace Express {
    interface Request {
      user: DecodedUser;
      files?: fileUpload.FileArray | null | undefined;
    }
  }
}
