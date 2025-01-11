"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const podcast_1 = __importDefault(require("./podcast"));
const subCategorySchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Podcast",
        },
    ],
});
subCategorySchema.pre("findOneAndDelete", async function (next) {
    const subCategory = await this.model.findOne(this.getQuery());
    if (subCategory) {
        await podcast_1.default.deleteMany({ category: subCategory._id });
    }
    next();
});
const SubCategory = (0, mongoose_1.model)("SubCategory", subCategorySchema);
exports.default = SubCategory;
