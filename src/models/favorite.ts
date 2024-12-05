import { Schema, model } from "mongoose";
import { FavoriteSchema } from "@schemas/favorite";

const favoriteSchema = new Schema<FavoriteSchema>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  podcasts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
  ],
});

const Favorite = model<FavoriteSchema>("Favorite", favoriteSchema);
export default Favorite;
