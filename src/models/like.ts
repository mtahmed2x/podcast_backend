import { Schema, model } from "mongoose";
import { LikeSchema } from "@schemas/like";

const likeSchema = new Schema<LikeSchema>(
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
  { timestamps: true },
);

const Like = model<LikeSchema>("Like", likeSchema);
export default Like;
