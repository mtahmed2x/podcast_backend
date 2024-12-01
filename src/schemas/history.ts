import { Document, Types } from "mongoose";

export type HistorySchema = Document & {
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
};
