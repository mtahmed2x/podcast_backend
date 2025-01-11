"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const get = async (req, res, next) => {
    const user = req.user;
    let error, profile;
    [error, profile] = await (0, await_to_ts_1.default)(user_1.default.findOne({ _id: user.userId }).lean());
    if (error)
        return next(error);
    if (!profile)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not Found"));
    profile = { ...profile, email: user.email };
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: profile });
};
const update = async (req, res, next) => {
    const userId = req.user.userId;
    const { name, dateOfBirth, gender, contact, address, avatarUrl } = req.body;
    console.log(req.body.avatarUrl);
    let error, user;
    [error, user] = await (0, await_to_ts_1.default)(user_1.default.findOne({ _id: userId }));
    if (error)
        return next(error);
    if (!user)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not Found"));
    user.name = name;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.contact = contact;
    user.address = address;
    if (avatarUrl) {
        // await Cloudinary.remove(user.avatar);
        user.avatar = avatarUrl;
    }
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: {} });
};
const updateLocation = async (req, res, next) => {
    const userId = req.user.userId;
    const { location } = req.body;
    const [error, user] = await (0, await_to_ts_1.default)(user_1.default.findByIdAndUpdate(userId, { $set: { locationPreference: location } }, { new: true }));
    if (error)
        return next(error);
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success", data: user?.locationPreference });
};
const UserController = {
    get,
    update,
    updateLocation,
};
exports.default = UserController;
