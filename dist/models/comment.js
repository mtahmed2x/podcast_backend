"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
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
    text: {
        type: String,
    },
});
const Comment = (0, mongoose_1.model)("Comment", commentSchema);
exports.default = Comment;
