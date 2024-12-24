import { Document } from "mongoose";

export type SupportSchema = Document & {
    text: string;
};
