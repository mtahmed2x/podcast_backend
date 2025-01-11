"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const likeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    podcast: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Podcast",
        required: true,
    },
}, { timestamps: true });
const Like = (0, mongoose_1.model)("Like", likeSchema);
exports.default = Like;
