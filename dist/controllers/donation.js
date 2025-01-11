"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const donation_1 = __importDefault(require("../models/donation"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const create = async (req, res, next) => {
    const user = req.user;
    const { url } = req.body;
    const [error, donation] = await (0, await_to_ts_1.default)(donation_1.default.create({ creator: user.creatorId, url: url }));
    if (error)
        return next(error);
    return res
        .status(http_status_1.default.CREATED)
        .json({ success: true, message: "Success", data: donation });
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const [error, donation] = await (0, await_to_ts_1.default)(donation_1.default.find({ creator: id }).lean());
    if (error)
        return next(error);
    if (!donation)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Donation Not Found"));
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: donation });
};
const getAll = async (req, res, next) => {
    const [error, donations] = await (0, await_to_ts_1.default)(donation_1.default.find().lean());
    if (error)
        return next(error);
    if (!donations)
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No Donations Found", data: [] });
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: donations });
};
const update = async (req, res, next) => {
    const user = req.user;
    const { url } = req.body;
    const [error, donation] = await (0, await_to_ts_1.default)(donation_1.default.findOneAndUpdate({ creator: user.creatorId }, { $set: { url } }, { new: true }));
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: donation });
};
const remove = async (req, res, next) => {
    const user = req.user;
    const [error, donation] = await (0, await_to_ts_1.default)(donation_1.default.findOneAndDelete({ creator: user.creatorId }));
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: donation });
};
const DonationController = {
    create,
    get,
    getAll,
    update,
    remove,
};
exports.default = DonationController;
