"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enums_1 = require("../shared/enums");
const notificationSchema = new mongoose_1.Schema({
    subject: {
        type: String,
        enum: enums_1.Subject,
        required: true,
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    podcast: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Podcast",
    },
    message: {
        type: String,
    },
    metadata: {
        userIds: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        paymentStatus: {
            type: String,
            enum: ["success", "failed"],
        },
        adminId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Auth",
        },
    },
    isRead: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });
const Notification = (0, mongoose_1.model)("Notification", notificationSchema);
exports.default = Notification;
