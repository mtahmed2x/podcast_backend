"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const about_1 = __importDefault(require("../models/about"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const add = async (req, res, next) => {
    const { text } = req.body;
    const [error, about] = await (0, await_to_ts_1.default)(about_1.default.create({ text: text }));
    if (error)
        return next(error);
    res.status(http_status_1.default.CREATED).json({ success: true, message: "Success", data: about });
};
const get = async (req, res, next) => {
    const [error, about] = await (0, await_to_ts_1.default)(about_1.default.findOne());
    if (error)
        return next(error);
    if (!about)
        return res.status(http_status_1.default.OK).json({ success: true, message: "No about us", data: {} });
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: about });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { text } = req.body;
    const [error, about] = await (0, await_to_ts_1.default)(about_1.default.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
    if (error)
        return next(error);
    if (!about)
        return res.status(http_status_1.default.OK).json({ success: true, message: "No about us", data: {} });
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: about });
};
const AboutController = {
    add,
    get,
    update,
};
exports.default = AboutController;
