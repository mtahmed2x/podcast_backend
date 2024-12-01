import { Schema, model } from "mongoose";
import { PlanSchema } from "@schemas/plan";

const planSchema = new Schema<PlanSchema>({
  name: {
    type: String,
    required: true,
    default: "free",
  },
  description: {
    type: String,
    required: true,
  },
  unitAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  interval: {
    type: String,
    enum: ["day", "week", "month", "year"],
  },
  productId: {
    type: String,
    default: "",
  },
  priceId: {
    type: String,
    default: "",
  },
});

const Plan = model<PlanSchema>("Plan", planSchema);
export default Plan;
