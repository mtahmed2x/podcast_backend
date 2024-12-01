import { Document, Types } from "mongoose";
import { Subject } from "@shared/enums";

export type NotificationSchema = Document & {
  creator: Types.ObjectId;
  podcast: Types.ObjectId;
  users: Types.ObjectId[];
  subject: Subject;
  message: string;
  isRead: boolean;
};
