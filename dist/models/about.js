"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AboutSchema = new mongoose_1.Schema({
    text: {
        type: String,
    },
});
const About = (0, mongoose_1.model)("About", AboutSchema);
exports.default = About;
