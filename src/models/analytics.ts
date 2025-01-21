import { AnalyticsSchema } from "@schemas/analytics";
import { Months } from "@shared/enums";
import { model, Schema } from "mongoose";

const analyticsSchema = new Schema<AnalyticsSchema>({
  month: {
    type: String,
    enum: Months,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  users: {
    type: Number,
    required: true,
  },
  income: {
    type: Number,
    required: true,
  },
});

const Analytics = model<AnalyticsSchema>("Analytics", analyticsSchema);
export default Analytics;
