"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    auth: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Creator",
        required: true,
    }
});
const Admin = (0, mongoose_1.model)("Admin", adminSchema);
exports.default = Admin;
