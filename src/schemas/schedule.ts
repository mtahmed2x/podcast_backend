import { Document, Types } from "mongoose";

export type ScheduleSchema = Document & {
  time: String;
  podcast: Types.ObjectId;
};
