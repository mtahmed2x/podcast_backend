import {Document, Types} from "mongoose";

export type SubCategorySchema = Document & {
    title: string;
    podcasts: Types.ObjectId[];
};