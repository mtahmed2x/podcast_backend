import { Schema, model } from "mongoose";
import { PodcastSchema } from "@schemas/podcast";

const podcastSchema = new Schema<PodcastSchema>(
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
    isAudio: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Podcast = model<PodcastSchema>("Podcast", podcastSchema);
export default Podcast;
