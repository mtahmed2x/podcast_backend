import { CreatorSchema } from "@type/schema";
import { Schema, model } from "mongoose";

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
});

const Creator = model<CreatorSchema>("Creator", creatorSchema);
export default Creator;
