import { Schema, model } from "mongoose";
import SubCategory from "@models/subCategory";
import { CategorySchema } from "@schemas/category";
import Podcast from "./podcast";

const categorySchema = new Schema<CategorySchema>({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    categoryImage: {
        type: String,
        required: true,
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
        await Podcast.deleteMany({ category: category._id });
    }
    next();
});

const Category = model<CategorySchema>("Category", categorySchema);
export default Category;
