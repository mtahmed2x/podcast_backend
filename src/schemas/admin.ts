import {Document, Types} from "mongoose";

export type AdminSchema = Document & {
    auth: Types.ObjectId;
    user: Types.ObjectId;
};