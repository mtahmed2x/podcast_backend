"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const report_1 = __importDefault(require("../models/report"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const http_errors_1 = __importDefault(require("http-errors"));
const podcast_1 = __importDefault(require("../models/podcast"));
const create = async (req, res, next) => {
    const userName = req.user.name;
    const { podcastId, description } = req.body;
    let error, podcast, report;
    [error, podcast] = await (0, await_to_ts_1.default)(podcast_1.default.findById(podcastId)
        .populate({
        path: "creator",
        select: "user",
        populate: { path: "user", select: "name" },
    })
        .then((podcast) => podcast));
    if (error)
        return next(error);
    if (!podcast)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Podcast not found"));
    [error, report] = await (0, await_to_ts_1.default)(report_1.default.create({
        podcastId,
        podcastName: podcast.title,
        podcastCover: podcast.cover,
        creatorName: podcast.creator.user.name,
        userName,
        date: Date.now(),
        description,
    }));
    if (error)
        return next(error);
    return res
        .status(http_status_1.default.CREATED)
        .json({ success: true, message: "Success", data: report });
};
const get = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [error, reports] = await (0, await_to_ts_1.default)(report_1.default.find().limit(limit).skip(skip).lean());
    if (error) {
        return next(error);
    }
    if (!reports)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Reports not found"));
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success", data: reports });
};
const reportController = {
    create,
    get,
};
exports.default = reportController;
