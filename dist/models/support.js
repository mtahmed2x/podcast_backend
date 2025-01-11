"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supportSchema = new mongoose_1.Schema({
    text: {
        type: String,
    },
});
const Support = (0, mongoose_1.model)("Support", supportSchema);
exports.default = Support;
