import { Document, Schema, Types, model } from "mongoose";

export type PodcastDocument = Document & {
  creator: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  title: string;
  description?: string;
  location: string;
  coverPhoto?: string;
  audio: string;
  duration: number;
  size: number;
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
    coverPhoto: {
      type: String,
    },
    audio: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    size: {
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
