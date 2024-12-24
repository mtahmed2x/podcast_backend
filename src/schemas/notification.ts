import { Document, Types } from "mongoose";
import { Subject } from "@shared/enums";

// // export type NotificationSchema = Document & {
// //   creator: Types.ObjectId;
// //   podcast: Types.ObjectId;
// //   users: Types.ObjectId[];
// //   subject: Subject;
// //   message: string;
// //   isRead: boolean;
// // };

export type NotificationSchema = Document & {
    subject: Subject;
    recipient: Types.ObjectId;
    podcast?: Types.ObjectId;
    role: "user" | "creator";
    message: string;
    metadata?: {
        userIds?: Types.ObjectId[];
        paymentStatus?: "success" | "failed";
        adminId?: Types.ObjectId;
    };
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
};
