"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const privacy_1 = __importDefault(require("../models/privacy"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const add = async (req, res, next) => {
    const { text } = req.body;
    const [error, privacy] = await (0, await_to_ts_1.default)(privacy_1.default.create({ text: text }));
    if (error)
        return next(error);
    res.status(http_status_1.default.CREATED).json({ success: true, message: "Success", data: privacy });
};
const get = async (req, res, next) => {
    const [error, privacy] = await (0, await_to_ts_1.default)(privacy_1.default.findOne());
    if (error)
        return next(error);
    if (!privacy)
        return res.status(http_status_1.default.OK).json({ success: true, message: "No privacy policy", data: {} });
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: privacy });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { text } = req.body;
    const [error, privacy] = await (0, await_to_ts_1.default)(privacy_1.default.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
    if (error)
        return next(error);
    if (!privacy)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Privacy policy not found"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: privacy });
};
const PrivacyController = {
    add,
    get,
    update,
};
exports.default = PrivacyController;
