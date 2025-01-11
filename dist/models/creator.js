"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const podcast_1 = __importDefault(require("./podcast"));
const creatorSchema = new mongoose_1.Schema({
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
    podcasts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Podcast",
        },
    ],
    donations: {
        type: String,
    },
});
creatorSchema.pre("findOneAndDelete", async function (next) {
    try {
        const creator = await this.model.findOne(this.getQuery());
        if (creator && creator.podcasts.length > 0) {
            await podcast_1.default.deleteMany({ _id: { $in: creator.podcasts } });
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const Creator = (0, mongoose_1.model)("Creator", creatorSchema);
exports.default = Creator;
