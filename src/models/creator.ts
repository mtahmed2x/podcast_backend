import { Document, Schema, Types, model } from "mongoose";

export type CreatorDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
};

const creatorSchema = new Schema<CreatorDocument>({
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

const Creator = model<CreatorDocument>("Creator", creatorSchema);
export default Creator;
