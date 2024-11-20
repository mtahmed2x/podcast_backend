import { Document, Schema, Types, model } from "mongoose";

export type FavoriteDocument = Document & {
  user: Types.ObjectId;
  podcast: Types.ObjectId;
};

const favoriteSchema = new Schema<FavoriteDocument>(
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

const Favorite = model<FavoriteDocument>("Favorite", favoriteSchema);
export default Favorite;
