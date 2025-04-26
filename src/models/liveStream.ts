import { LiveStreamSchema } from "@schemas/liveStream";
import { Schema, model } from "mongoose";

const liveStreamSchema = new Schema<LiveStreamSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: String,
      ref: "Podcast",
      required: true,
    },
  },
  { timestamps: true },
);

const LiveStream = model<LiveStreamSchema>("LiveStream", liveStreamSchema);
export default LiveStream;
