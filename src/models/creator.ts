import { CreatorSchema } from "@schemas/creator";
import { Schema, model } from "mongoose";
import Podcast from "@models/podcast";

const creatorSchema = new Schema<CreatorSchema>({
  auth: {
    type: Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  podcasts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
  ],
  donations: {
    type: String,
  },
});

creatorSchema.pre("findOneAndDelete", async function (next) {
  try {
    const creator = await this.model.findOne(this.getQuery());
    if (creator && creator.podcasts.length > 0) {
      await Podcast.deleteMany({ _id: { $in: creator.podcasts } });
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

const Creator = model<CreatorSchema>("Creator", creatorSchema);
export default Creator;
