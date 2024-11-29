import {Document, Types} from "mongoose";

export type UserSchema = Document & {
    auth: Types.ObjectId;
    name: string;
    dateOfBirth: string;
    gender: string;
    contact: string;
    address: string;
    avatar: string;
};