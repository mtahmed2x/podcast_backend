import { Schema, model } from "mongoose";
import { NotificationSchema } from "@schemas/notification";
import { Subject } from "@shared/enums";

const notificationSchema = new Schema<NotificationSchema>(
    {
        subject: {
            type: String,
            enum: Subject,
            required: true,
        },
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        podcast: {
            type: Schema.Types.ObjectId,
            ref: "Podcast",
        },
        message: {
            type: String,
        },
        metadata: {
            userIds: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            paymentStatus: {
                type: String,
                enum: ["success", "failed"],
            },
            adminId: {
                type: Schema.Types.ObjectId,
                ref: "Auth",
            },
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
