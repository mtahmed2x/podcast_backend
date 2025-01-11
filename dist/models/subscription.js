"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enums_1 = require("../shared/enums");
const subscriptionSchema = new mongoose_1.Schema({
    plan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    stripeSubscriptionId: {
        type: String,
        default: null,
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: enums_1.SubscriptionStatus,
        required: true,
    },
    startDate: {
        type: Date,
        default: null,
    },
    endDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
const Subscription = (0, mongoose_1.model)("Subscription", subscriptionSchema);
exports.default = Subscription;
