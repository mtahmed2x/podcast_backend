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

// subCategorySchema.pre("findByIdAndDelete", async function (next: NextFunction) {
//     const id = this.getQuery()._id;
//     const subCategory = await this.model.findById(id);
//     if (!subCategory) return next();
//     await Podcast.deleteMany({ subCategory: id });
//     next();
//   });

const SubCategory = model<SubCategoryDocument>(
  "SubCategory",
  subCategorySchema
);
export default SubCategory;
