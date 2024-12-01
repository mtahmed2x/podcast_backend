import { Document, Types } from "mongoose";

export type PodcastSchema = Document & {
  creator: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  title: string;
  description?: string;
  location: string;
  cover?: string;
  coverFormat?: string;
  coverSize?: number;
  audio: string;
  audioFormat: string;
  audioDuration: number;
  audioSize: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  totalFavorites: number;
  createdAt?: Date;
  updatedAt?: Date;
};
