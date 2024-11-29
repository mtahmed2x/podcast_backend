import { Document, Schema, Types, model } from "mongoose";
import {FavoriteSchema} from "@schemas/favorite";

const favoriteSchema = new Schema<FavoriteSchema>(
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

const Favorite = model<FavoriteSchema>("Favorite", favoriteSchema);
export default Favorite;
