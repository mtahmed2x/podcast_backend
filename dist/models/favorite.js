"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const favoriteSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    podcasts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Podcast",
        },
    ],
});
const Favorite = (0, mongoose_1.model)("Favorite", favoriteSchema);
exports.default = Favorite;
