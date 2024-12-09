import { Schema, model } from "mongoose";
import { SubscriptionSchema } from "@schemas/subscription";
import { SubscriptionStatus } from "@shared/enums";

const subscriptionSchema = new Schema<SubscriptionSchema>(
  {
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: SubscriptionStatus,
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Subscription = model<SubscriptionSchema>("Subscription", subscriptionSchema);
export default Subscription;
