"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faq_1 = __importDefault(require("../models/faq"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const add = async (req, res, next) => {
    const { question, answer } = req.body;
    const [error, faq] = await (0, await_to_ts_1.default)(faq_1.default.create({ question, answer }));
    if (error)
        return next(error);
    res.status(http_status_1.default.CREATED).json({ success: true, message: "Success", data: faq });
};
const get = async (req, res, next) => {
    const [error, faqs] = await (0, await_to_ts_1.default)(faq_1.default.find().lean());
    if (error)
        return next(error);
    if (!faqs)
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No Faq found", data: { faqs: [] } });
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: faqs });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { question, answer } = req.body;
    let error, faq;
    [error, faq] = await (0, await_to_ts_1.default)(faq_1.default.findById(id));
    if (error)
        return next(error);
    if (!faq)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Faq Not Found"));
    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    [error] = await (0, await_to_ts_1.default)(faq.save());
    if (error)
        return next(error);
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: faq });
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    const [error, faq] = await (0, await_to_ts_1.default)(faq_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    if (!faq)
        return next((0, http_errors_1.default)(404, "Faq Not Found"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: {} });
};
const FaqController = {
    add,
    get,
    update,
    remove,
};
exports.default = FaqController;
