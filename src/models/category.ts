import { Document, Schema, Types, model } from "mongoose";
import SubCategory from "@models/subCategory";

export type CategoryDocument = Document & {
  title: string;
  subCategories: Types.ObjectId[];
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
});

categorySchema.pre("findOneAndDelete", async function (next) {
  const category = await this.model.findOne(this.getQuery());
  if (category) {
    await SubCategory.deleteMany({ _id: { $in: category.subCategories } });
  }
  next();
});

const Category = model<CategoryDocument>("Category", categorySchema);
export default Category;
