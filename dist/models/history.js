"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const historySchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    podcasts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Podcast",
        },
    ],
});
const History = (0, mongoose_1.model)("History", historySchema);
exports.default = History;
