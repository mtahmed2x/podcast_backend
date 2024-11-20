import { Document, Schema, Types, model } from "mongoose";

export type LikeDocument = Document & {
  user: Types.ObjectId;
  podcast: Types.ObjectId;
};

const likeSchema = new Schema<LikeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    podcast: {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
      required: true,
    },
  },
  { timestamps: true }
);

const Like = model<LikeDocument>("Like", likeSchema);
export default Like;
