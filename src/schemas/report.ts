import { Document, Types } from "mongoose";

export type ReportSchema = Document & {
    podcastId: Types.ObjectId;
    podcastName: string;
    podcastCover: string;
    cretorName: string;
    userName: string;
    date: Date;
    description: string;
};
