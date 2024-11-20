import { Document, Schema, Types, model } from "mongoose";

export type SubscriptionDocument = Document & {
  plan: Types.ObjectId;
  user: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: "active" | "inactive" | "pending";
};

const subscriptionSchema = new Schema<SubscriptionDocument>({
  plan: {
    type: Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
});

const Subscription = model<SubscriptionDocument>(
  "Subscription",
  subscriptionSchema
);
export default Subscription;
