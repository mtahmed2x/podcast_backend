import { Schema, model } from "mongoose";
import { HistorySchema } from "@schemas/history";

const historySchema = new Schema<HistorySchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  podcasts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
  ],
});

const History = model<HistorySchema>("History", historySchema);
export default History;
