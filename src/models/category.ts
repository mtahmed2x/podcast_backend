import { Document, Schema, Types, model } from "mongoose";

export type CategoryDocument = Document & {
  title: string;
  subCategories: Types.ObjectId[];
  podcasts?: Types.ObjectId[];
};

const categorySchema = new Schema<CategoryDocument>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  subCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
  ],
  podcasts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
  ],
});

const Category = model<CategoryDocument>("Category", categorySchema);
export default Category;
