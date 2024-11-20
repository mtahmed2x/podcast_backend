import { Document, Schema, Types, model } from "mongoose";

export type PlaylistDocument = Document & {
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
  title: string;
};

const playlistSchema = new Schema<PlaylistDocument>(
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

const Playlist = model<PlaylistDocument>("Playlist", playlistSchema);
export default Playlist;
