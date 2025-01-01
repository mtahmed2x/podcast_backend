import { Document, Types } from "mongoose";

export type ReportSchema = Document & {
  podcastId: Types.ObjectId;
  podcastName: string;
  podcastCover: string;
  creatorName: string;
  userName: string;
  date: Date;
  description: string;
};
