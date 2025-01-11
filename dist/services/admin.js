"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("../models/auth"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const approve = async (req, res, next) => {
    const id = req.params.id;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findByIdAndUpdate(id, { $set: { isApproved: true } }, { new: true }));
    if (error)
        next(error);
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: { isApproved: auth?.isApproved },
    });
};
const block = async (req, res, next) => {
    const id = req.params.id;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findByIdAndUpdate(id, { $set: { isBlocked: true } }, { new: true }));
    if (error)
        next(error);
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: { isBlocked: auth?.isBlocked },
    });
};
const unblock = async (req, res, next) => {
    const id = req.params.id;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findByIdAndUpdate(id, { $set: { isBlocked: false } }, { new: true }));
    if (error)
        next(error);
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: { isBlocked: auth?.isBlocked },
    });
};
const AdminServices = {
    approve,
    block,
    unblock,
};
exports.default = AdminServices;
