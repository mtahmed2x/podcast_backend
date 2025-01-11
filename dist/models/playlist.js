"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const playlistSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    podcasts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Podcast",
            required: true,
        },
    ],
    title: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });
const Playlist = (0, mongoose_1.model)("Playlist", playlistSchema);
exports.default = Playlist;
