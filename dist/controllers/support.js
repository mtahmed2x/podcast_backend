"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const support_1 = __importDefault(require("../models/support"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const create = async (req, res, next) => {
    const { text } = req.body;
    const [error, support] = await (0, await_to_ts_1.default)(support_1.default.create({ text: text }));
    if (error)
        return next(error);
    res.status(201).json({ message: "Success", data: support });
};
const get = async (req, res, next) => {
    const [error, support] = await (0, await_to_ts_1.default)(support_1.default.findOne().limit(1));
    if (error)
        return next(error);
    if (!support)
        return next((0, http_errors_1.default)(404, "Supports not found"));
    res.status(200).json({ message: "Success", data: support });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { text } = req.body;
    const [error, support] = await (0, await_to_ts_1.default)(support_1.default.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
    if (error)
        return next(error);
    if (!support)
        return next((0, http_errors_1.default)(404, "Support not found"));
    res.status(200).json({ message: "Success", data: support });
};
const SupportController = {
    create,
    get,
    update,
};
exports.default = SupportController;
