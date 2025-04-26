import { Document, Types } from "mongoose";

export type LiveStreamSchema = Document & {
  user: Types.ObjectId;
  roomId: string;
};
