import { Request } from "express";
import { Types } from "mongoose";
import { CategoryDocument } from "@models/category";
import { SubCategoryDocument } from "@models/subCategory";
import { DecodedUser } from "@type/schema";

declare global {
  namespace Express {
    interface Request {
      user: DecodedUser;
      category: CategoryDocument;
      subCategory: SubCategoryDocument;
    }
  }
}
