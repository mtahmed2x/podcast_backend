import { ReportSchema } from "@schemas/report";
import { Schema, model } from "mongoose";

const reportSchema = new Schema<ReportSchema>({
  podcastId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  podcastName: {
    type: String,
    required: true,
  },
  podcastCover: {
    type: String,
    required: true,
  },
  creatorName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Report = model<ReportSchema>("Report", reportSchema);
export default Report;
