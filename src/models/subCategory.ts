import { Document, Schema, Types, model } from "mongoose";

export type SubCategoryDocument = Document & {
  title: string;
  podcasts: Types.ObjectId[];
};

const subCategorySchema = new Schema<SubCategoryDocument>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  podcasts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
  ],
});

const SubCategory = model<SubCategoryDocument>(
  "SubCategory",
  subCategorySchema
);
export default SubCategory;
