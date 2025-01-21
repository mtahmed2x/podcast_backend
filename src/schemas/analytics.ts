import { Document } from "mongoose";

export type AnalyticsSchema = Document & {
  month: string;
  year: number;
  users: number;
  income: number;
};
