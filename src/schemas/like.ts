import { Document, Types } from "mongoose";

export type LikeSchema = Document & {
  user: Types.ObjectId;
  podcast: Types.ObjectId;
};
