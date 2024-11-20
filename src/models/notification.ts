import { Document, Schema, Types, model } from "mongoose";

export type NotificationDocument = Document & {
  creator: Types.ObjectId;
  podcast: Types.ObjectId;
  users: Types.ObjectId[];
  subject: "like" | "comment" | "favorite" | "donation";
  message: string;
  isRead: boolean;
};

const notificationSchema = new Schema<NotificationDocument>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
    },
    podcast: {
      type: Schema.Types.ObjectId,
      ref: "Podcast",
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    subject: {
      type: String,
      enum: ["like", "comment", "favorite", "donation"],
    },
    message: {
      type: String,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = model<NotificationDocument>(
  "Notification",
  notificationSchema
);

export default Notification;
