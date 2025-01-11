"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
require("dotenv/config");
const auth_1 = __importDefault(require("../models/auth"));
const user_1 = __importDefault(require("../models/user"));
const creator_1 = __importDefault(require("../models/creator"));
const admin_1 = __importDefault(require("../models/admin"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const generateOTP_1 = __importDefault(require("../utils/generateOTP"));
const jwt_1 = require("../utils/jwt");
const enums_1 = require("../shared/enums");
const register = async (req, res, next) => {
    const { name, email, role, dateOfBirth, address, password, confirmPassword } = req.body;
    let error, auth, user, creator, admin;
    [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (auth) {
        const otp = (0, generateOTP_1.default)();
        auth.verificationOTP = otp;
        auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
        await auth.save();
        await (0, sendEmail_1.default)(email, otp);
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: "Email already exists",
            data: auth.isVerified,
        });
    }
    const verificationOTP = (0, generateOTP_1.default)();
    const verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.create({
            email,
            password: hashedPassword,
            role,
            isApproved: role === enums_1.Role.USER || role === enums_1.Role.ADMIN,
            verificationOTP: verificationOTP,
            verificationOTPExpire,
        }));
        if (error)
            throw error;
        [error, user] = await (0, await_to_ts_1.default)(user_1.default.create({
            auth: auth._id,
            name: name,
            dateOfBirth: dateOfBirth,
            address: address,
        }));
        if (error)
            throw error;
        if (role === "CREATOR" || role === "ADMIN") {
            [error, creator] = await (0, await_to_ts_1.default)(creator_1.default.create({
                auth: auth._id,
                user: user._id,
            }));
            if (error)
                throw error;
        }
        if (role === "ADMIN") {
            [error, admin] = await (0, await_to_ts_1.default)(admin_1.default.create({
                auth: auth._id,
                user: user._id,
                creator: creator._id,
            }));
        }
        await (0, sendEmail_1.default)(email, verificationOTP);
        await session.commitTransaction();
        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: auth.isVerified,
        });
    }
    catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        return next(error);
    }
    finally {
        await session.endSession();
    }
};
const resendOTP = async (req, res, next) => { };
const verifyEmail = async (payload) => {
    const { email, verificationOTP } = payload;
    let [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findOne({ email }).select("-password"));
    if (error)
        return [error, null];
    if (!auth)
        return [(0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not found"), null];
    if (auth.verificationOTP === null)
        return [(0, http_errors_1.default)(http_status_1.default.UNAUTHORIZED, "OTP Expired"), null];
    if (verificationOTP !== auth.verificationOTP)
        return [(0, http_errors_1.default)(http_status_1.default.UNAUTHORIZED, "Wrong OTP"), null];
    return [null, auth];
};
const activate = async (req, res, next) => {
    const [error, auth] = await verifyEmail(req.body);
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not Found"));
    auth.verificationOTP = "";
    auth.verificationOTPExpire = null;
    auth.isVerified = true;
    await auth.save();
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret)
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    const accessToken = (0, jwt_1.generateToken)(auth._id.toString(), accessSecret, "96h");
    const user = await user_1.default.find({ auth: auth._id });
    const responseData = {
        accessToken,
        auth,
        user,
    };
    let creator;
    if (auth.role === enums_1.Role.CREATOR) {
        creator = await creator_1.default.find({ auth: auth._id });
        responseData.creator = creator;
    }
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: responseData });
};
const login = async (req, res, next) => {
    const { email, password } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(404, "Email don't exist"));
    const isPasswordValid = await bcrypt_1.default.compare(password, auth.password);
    if (!isPasswordValid)
        return next((0, http_errors_1.default)(http_status_1.default.UNAUTHORIZED, "Wrong password"));
    if (!auth.isVerified)
        return next((0, http_errors_1.default)(http_status_1.default.UNAUTHORIZED, "Verify your email first"));
    if (auth.isBlocked)
        return next((0, http_errors_1.default)(http_status_1.default.FORBIDDEN, "Your account had been blocked. Contact Administrator"));
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret)
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    const accessToken = (0, jwt_1.generateToken)(auth._id.toString(), accessSecret, "96h");
    const refreshToken = (0, jwt_1.generateToken)(auth._id.toString(), refreshSecret, "96h");
    const user = await user_1.default.find({ auth: auth._id });
    const responseData = {
        accessToken,
        auth,
        user,
    };
    let creator;
    if (auth.role === enums_1.Role.CREATOR) {
        creator = await creator_1.default.find({ auth: auth._id });
        responseData.creator = creator;
    }
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: responseData });
};
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not Found"));
    const verificationOTP = (0, generateOTP_1.default)();
    auth.verificationOTP = verificationOTP;
    auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
    await auth.save();
    await (0, sendEmail_1.default)(email, verificationOTP);
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success. Verification mail sent." });
};
const verifyOTP = async (req, res, next) => {
    const [error, auth] = await verifyEmail(req.body);
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not Found"));
    const secret = process.env.JWT_RECOVERY_SECRET;
    if (!secret) {
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    }
    const recoveryToken = (0, jwt_1.generateToken)(auth._id.toString(), secret, "20m");
    if (!recoveryToken)
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed"));
    res.status(200).json({ success: true, message: "Success", data: {} });
};
const resetPassword = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findOne({ email }));
    if (error)
        return next(error);
    if (!auth)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Account Not Found"));
    if (password !== confirmPassword)
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Passwords don't match"));
    auth.password = await bcrypt_1.default.hash(password, 10);
    await auth.save();
    return res
        .status(http_status_1.default.OK)
        .json({ success: true, message: "Success. Password changed", data: {} });
};
const getAccessToken = async (req, res, next) => {
    const user = req.user;
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    }
    const accessToken = (0, jwt_1.generateToken)(user.authId, secret, "96h");
    if (!accessToken)
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed"));
    res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: accessToken });
};
const remove = async (req, res, next) => {
    const user = req.user;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await auth_1.default.findByIdAndDelete(user.authId);
        await user_1.default.findByIdAndDelete(user.userId);
        if (user.role === enums_1.Role.CREATOR) {
            await creator_1.default.findByIdAndDelete(user.creatorId);
        }
    }
    catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
            await session.endSession();
        }
        return next((0, http_errors_1.default)(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to delete account"));
    }
    finally {
        await session.commitTransaction();
        await session.endSession();
    }
    return res.status(http_status_1.default.OK).json({ success: true, message: "Successful" });
};
const AuthController = {
    register,
    activate,
    login,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getAccessToken,
    remove,
};
exports.default = AuthController;
