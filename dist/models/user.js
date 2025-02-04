"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enums_1 = require("../shared/enums");
const userSchema = new mongoose_1.Schema({
    auth: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: enums_1.Gender,
    },
    contact: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    backgroundImage: {
        type: String,
        default: "",
    },
    locationPreference: {
        type: String,
        default: "",
    },
    notification: [
        {
            subject: {
                type: String,
                enum: enums_1.Subject,
                required: true,
            },
            podcast: {
                type: mongoose_1.Schema.Types.ObjectId,
                required: false,
            },
            message: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                required: true,
            },
            updatedAt: {
                type: Date,
            },
        },
    ],
}, { timestamps: true });
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
