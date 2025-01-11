"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const donationSchema = new mongoose_1.Schema({
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Creator",
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
});
const Donation = (0, mongoose_1.model)("Donation", donationSchema);
exports.default = Donation;
