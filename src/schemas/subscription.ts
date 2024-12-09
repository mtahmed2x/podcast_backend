import { Document, Types } from "mongoose";
import { SubscriptionStatus } from "@shared/enums";
import { PlanSchema } from "@schemas/plan";

export type SubscriptionSchema = Document & {
  plan: Types.ObjectId | PlanSchema;
  user: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
};
