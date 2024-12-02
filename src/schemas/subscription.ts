import { Document, Types } from "mongoose";
import { SubscriptionStatus } from "@shared/enums";

export type SubscriptionSchema = Document & {
  plan: Types.ObjectId;
  user: Types.ObjectId;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
};
