import { Schema, model } from "mongoose";
import { SubCategorySchema } from "@schemas/subCategory";
import Podcast from "./podcast";

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

subCategorySchema.pre("findOneAndDelete", async function (next) {
    const subCategory = await this.model.findOne(this.getQuery());
    if (subCategory) {
        await Podcast.deleteMany({ category: subCategory._id });
    }
    next();
});

const SubCategory = model<SubCategorySchema>("SubCategory", subCategorySchema);
export default SubCategory;
