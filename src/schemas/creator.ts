import { Document, Types } from "mongoose";

export type CreatorSchema = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
};
