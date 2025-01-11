"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const logger_1 = require("../shared/logger");
const http_status_1 = __importDefault(require("http-status"));
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`${err.message}\n${err.stack}\n${err.name}`);
    if (http_errors_1.default.isHttpError(err)) {
        return res
            .status(err.status)
            .json({ success: false, message: err.message, data: {} });
    }
    else if (err.name === "ValidationError") {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json({ success: false, message: err.message, data: {} });
    }
    return res
        .status(http_status_1.default.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: err.message, data: {} });
};
exports.errorHandler = errorHandler;
