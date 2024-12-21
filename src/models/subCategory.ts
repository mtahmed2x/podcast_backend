import { Schema, model } from "mongoose";
import { SubCategorySchema } from "@schemas/subCategory";

const subCategorySchema = new Schema<SubCategorySchema>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  subCategoryImage: {
    type: String,
    required: true,
  },
  podcasts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
  ],
});

const SubCategory = model<SubCategorySchema>("SubCategory", subCategorySchema);
export default SubCategory;
