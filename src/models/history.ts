import { Document, Schema, Types, model } from "mongoose";

export type HistoryDocument = Document & {
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
};

const historySchema = new Schema<HistoryDocument>({
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

const History = model<HistoryDocument>("History", historySchema);
export default History;
