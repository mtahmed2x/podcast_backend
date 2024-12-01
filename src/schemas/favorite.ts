import { Document, Types } from "mongoose";
export type FavoriteSchema = Document & {
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
};
