import {Document, Types} from "mongoose";

export type SubscriptionSchema = Document & {
    plan: Types.ObjectId;
    user: Types.ObjectId;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    status: "active" | "inactive" | "pending";
    startDate?: Date;
    endDate?: Date;
};