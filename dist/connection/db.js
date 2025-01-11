"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const logger_1 = require("../shared/logger");
const connectDB = async (uri) => {
    const [error] = await (0, await_to_ts_1.default)(mongoose_1.default.connect(uri));
    if (error) {
        logger_1.logger.error(error);
        return;
    }
};
exports.default = connectDB;
