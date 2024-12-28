import { Document, Types } from "mongoose";

export type DonationSchema = Document & {
    creator: Types.ObjectId;
    url: string;
};
