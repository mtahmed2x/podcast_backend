import { Document, Types } from "mongoose";

export type PlaylistSchema = Document & {
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
  title: string;
};
