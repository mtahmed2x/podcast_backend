import { Schema, model } from "mongoose";
import {PlaylistSchema} from "@schemas/playlist";

const playlistSchema = new Schema<PlaylistSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    podcasts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Podcast",
        required: true,
      },
    ],
    title: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Playlist = model<PlaylistSchema>("Playlist", playlistSchema);
export default Playlist;
