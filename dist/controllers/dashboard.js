"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const auth_1 = __importDefault(require("../models/auth"));
const creator_1 = __importDefault(require("../models/creator"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const admin_1 = __importDefault(require("../models/admin"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const enums_1 = require("../shared/enums");
const displayAllUsers = async (req, res, next) => {
    const [error, users] = await (0, await_to_ts_1.default)(user_1.default.find()
        .populate({
        path: "auth",
        match: { role: enums_1.Role.USER },
        select: "email role subscriptionType isBlocked",
    })
        .exec()
        .then((users) => users.filter((user) => user.auth)));
    if (error)
        return next(error);
    return res.status(200).json({ message: "Successful", data: users });
};
const searchUsersByName = async (req, res, next) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Please provide a name to search.",
            data: {},
        });
    }
    const searchQuery = {
        name: { $regex: name, $options: "i" },
    };
    const [error, users] = await (0, await_to_ts_1.default)(user_1.default.find(searchQuery)
        .populate({
        path: "auth",
        match: { role: enums_1.Role.USER },
        select: "email role subscriptionType isBlocked",
    })
        .exec()
        .then((users) => users.filter((user) => user.auth)));
    if (error)
        return next(error);
    return res
        .status(200)
        .json({ success: true, message: "Successful", data: users });
};
const displayAllCreators = async (req, res, next) => {
    const [error, creators] = await (0, await_to_ts_1.default)(creator_1.default.find().populate({
        path: "user",
        populate: { path: "auth", select: "email subscriptionType isBlocked" },
    }));
    if (error)
        return next(error);
    return res.status(200).json({ message: "Successful", data: creators });
};
const searchCreatorsByName = async (req, res, next) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({
            message: "Please provide a name to search.",
        });
    }
    const searchQuery = { $regex: name, $options: "i" }; // Case-insensitive partial match
    const [error, creators] = await (0, await_to_ts_1.default)(creator_1.default.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $lookup: {
                from: "auths",
                localField: "user.auth",
                foreignField: "_id",
                as: "user.auth",
            },
        },
        {
            $unwind: "$user.auth",
        },
        {
            $match: {
                "user.name": searchQuery,
            },
        },
        {
            $project: {
                _id: 1,
                "user.name": 1,
                "user.contact": 1,
                "user.address": 1,
                "user.dateOfBirth": 1,
                "user.gender": 1,
                "user.avatar": 1,
                "user.auth.email": 1,
                "user.auth.subscriptionType": 1,
                "user.auth.isBlocked": 1,
            },
        },
    ]));
    if (error)
        return next(error);
    if (!creators || creators.length === 0) {
        return res.status(404).json({
            message: "No creators found with the given name.",
            data: [],
        });
    }
    return res.status(200).json({ message: "Successful", data: creators });
};
const adminProfile = async (req, res, next) => {
    const user = req.user;
    const [error, admin] = await (0, await_to_ts_1.default)(admin_1.default.findOne({ auth: user.authId, user: user.userId })
        .populate({ path: "auth", select: "email role -_id" })
        .populate({ path: "user", select: "name contact address -_id" }));
    if (error)
        return next(error);
    if (!admin)
        return next((0, http_errors_1.default)(404, "No Admin Found"));
    return res
        .status(200)
        .json({ success: true, message: "Success", data: admin });
};
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "96h" });
};
const login = async (req, res, next) => {
    const { email, password } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (!auth)
        return res.status(404).json({ error: "Email don't exist" });
    const isPasswordValid = await bcrypt_1.default.compare(password, auth.password);
    if (!isPasswordValid)
        return res.status(401).json({ error: "Wrong password" });
    if (auth.role !== "ADMIN") {
        return next((0, http_errors_1.default)(403, "Access Denied. Only Admin Allowed"));
    }
    const token = generateToken(auth._id.toString());
    return res.status(200).json({ message: "Login Successful", token: token });
};
const updateProfile = async (req, res, next) => {
    const user = req.user;
    const { name, contact, address } = req.body;
    const updateFields = {};
    if (name)
        updateFields.name = name;
    if (contact)
        updateFields.contact = contact;
    if (address)
        updateFields.address = address;
    if (Object.keys(updateFields).length === 0)
        return res.status(400).json({ error: "Nothing to update" });
    const [error, updatedUser] = await (0, await_to_ts_1.default)(user_1.default.findByIdAndUpdate(user.userId, { $set: updateFields }, { new: true }));
    if (error)
        return next(error);
    return res
        .status(200)
        .json({ message: "Update successful", data: updatedUser });
};
const changePassword = async (req, res, next) => {
    const user = req.user;
    const { password, newPassword, confirmPassword } = req.body;
    let [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findById(user.authId));
    if (error)
        return next(error);
    const isPasswordValid = await bcrypt_1.default.compare(password, auth.password);
    if (!isPasswordValid)
        return next((0, http_errors_1.default)(401, "Incorrect Password"));
    if (newPassword !== confirmPassword)
        return next((0, http_errors_1.default)(400, "Password's don't match"));
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findByIdAndUpdate(user.authId, { $set: { password: hashedPassword } }, { new: true }));
    if (error)
        return next(error);
    res.status(200).json({ success: true, message: "Success", data: {} });
};
const totalSubscriber = async (req, res, next) => {
    return res.status(200).json({ success: true, message: "Success", data: 20 });
};
const incomeByMonth = async (req, res, next) => {
    const income = {
        Jan: 3200,
        Feb: 2800,
        Mar: 3500,
        Apr: 3000,
        May: 4000,
        Jun: 3200,
        Jul: 3100,
        Aug: 3300,
        Sep: 3400,
        Oct: 3700,
        Nov: 3600,
        Dec: 3800,
    };
    return res
        .status(200)
        .json({ success: true, message: "Success", data: income });
};
const subscribersByMonth = async (req, res, next) => {
    const subscribers = {
        Jan: 1200,
        Feb: 1150,
        Mar: 1300,
        Apr: 1400,
        May: 1600,
        Jun: 1550,
        Jul: 1700,
        Aug: 1800,
        Sep: 1900,
        Oct: 2000,
        Nov: 2100,
        Dec: 2200,
    };
    return res
        .status(200)
        .json({ success: true, message: "Success", data: subscribers });
};
const DashboardController = {
    displayAllUsers,
    displayAllCreators,
    adminProfile,
    login,
    updateProfile,
    changePassword,
    totalSubscriber,
    incomeByMonth,
    subscribersByMonth,
    searchUsersByName,
    searchCreatorsByName,
};
exports.default = DashboardController;
