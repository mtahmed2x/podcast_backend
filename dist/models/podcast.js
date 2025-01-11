"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const podcastSchema = new mongoose_1.Schema({
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Creator",
        required: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
    },
    coverFormat: {
        type: String,
    },
    coverSize: {
        type: Number,
    },
    audio: {
        type: String,
        required: true,
    },
    audioDuration: {
        type: Number,
        required: true,
    },
    audioFormat: {
        type: String,
        required: true,
    },
    audioSize: {
        type: Number,
        required: true,
    },
    totalLikes: {
        type: Number,
        default: 0,
        required: true,
    },
    totalViews: {
        type: Number,
        default: 0,
        required: true,
    },
    totalComments: {
        type: Number,
        default: 0,
        required: true,
    },
    totalFavorites: {
        type: Number,
        default: 0,
        required: true,
    },
}, {
    timestamps: true,
});
const Podcast = (0, mongoose_1.model)("Podcast", podcastSchema);
exports.default = Podcast;
