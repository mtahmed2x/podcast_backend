import {Document, Types} from "mongoose";

export type FavoriteSchema = Document & {
    user: Types.ObjectId;
    podcast: Types.ObjectId;
};