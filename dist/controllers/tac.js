"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tac_1 = __importDefault(require("../models/tac"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const add = async (req, res, next) => {
    const { text } = req.body;
    const [error, tac] = await (0, await_to_ts_1.default)(tac_1.default.create({ text: text }));
    if (error)
        return next(error);
    res.status(http_status_1.default.CREATED).json({ success: true, message: "Success", data: tac });
};
const get = async (req, res, next) => {
    const [error, tac] = await (0, await_to_ts_1.default)(tac_1.default.findOne().lean());
    if (error)
        return next(error);
    if (!tac)
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No terms and conditions", data: {} });
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: tac });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { text } = req.body;
    const [error, tac] = await (0, await_to_ts_1.default)(tac_1.default.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }));
    if (error)
        return next(error);
    if (!tac)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Terms and condition not found"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: tac });
};
const TaCController = {
    add,
    get,
    update,
};
exports.default = TaCController;
