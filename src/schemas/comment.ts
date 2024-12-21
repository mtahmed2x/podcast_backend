import { Document, Types } from "mongoose";

export type CommentSchema = Document & {
  user: Types.ObjectId;
  podcast: Types.ObjectId;
  text: string;
};
