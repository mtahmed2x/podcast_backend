import { Schema, model } from "mongoose";
import { NotificationSchema } from "@schemas/notification";
import { Subject } from "@shared/enums";

const notificationSchema = new Schema<NotificationSchema>(
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
      enum: Subject,
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
  { timestamps: true },
);

const Notification = model<NotificationSchema>("Notification", notificationSchema);

export default Notification;
