"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    podcastId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    podcastName: {
        type: String,
        required: true,
    },
    podcastCover: {
        type: String,
        required: true,
    },
    creatorName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});
const Report = (0, mongoose_1.model)("Report", reportSchema);
exports.default = Report;
