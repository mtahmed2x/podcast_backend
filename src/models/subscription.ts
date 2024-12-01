import { Schema, model } from "mongoose";
import { SubscriptionSchema } from "@schemas/subscription";

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
    },
    stripeCustomerId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Subscription = model<SubscriptionSchema>("Subscription", subscriptionSchema);
export default Subscription;
