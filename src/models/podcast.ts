import { Document, Schema, Types, model } from "mongoose";

export type PodcastDocument = Document & {
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

const podcastSchema = new Schema<PodcastDocument>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    coverFormat: {
      type: String,
    },
    coverSize: {
      type: Number,
    },
    audio: {
      type: String,
      required: true,
    },
    audioDuration: {
      type: Number,
      required: true,
    },
    audioFormat: {
      type: String,
      required: true,
    },
    audioSize: {
      type: Number,
      required: true,
    },
    totalLikes: {
      type: Number,
      default: 0,
      required: true,
    },
    totalViews: {
      type: Number,
      default: 0,
      required: true,
    },
    totalComments: {
      type: Number,
      default: 0,
      required: true,
    },
    totalFavorites: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Podcast = model<PodcastDocument>("Podcast", podcastSchema);
export default Podcast;
