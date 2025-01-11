"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrCreator = exports.isUserOrCreator = exports.isCreator = exports.isAdmin = exports.recoveryAuthorize = exports.refreshAuthorize = exports.authorize = exports.getUserInfo = void 0;
const await_to_ts_1 = __importDefault(require("await-to-ts"));
require("dotenv/config");
const http_errors_1 = __importDefault(require("http-errors"));
const auth_1 = __importDefault(require("../models/auth"));
const user_1 = __importDefault(require("../models/user"));
const creator_1 = __importDefault(require("../models/creator"));
const admin_1 = __importDefault(require("../models/admin"));
const enums_1 = require("../shared/enums");
const jwt_1 = require("../utils/jwt");
const http_status_1 = __importDefault(require("http-status"));
const getUserInfo = async (authId) => {
    let error, auth, user, creator, admin;
    [error, auth] = await (0, await_to_ts_1.default)(auth_1.default.findById(authId).select("email role isVerified isBlocked"));
    if (error || !auth)
        return null;
    [error, user] = await (0, await_to_ts_1.default)(user_1.default.findOne({ auth: authId }));
    if (error || !user)
        return null;
    const data = {
        authId: auth._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        role: auth.role,
        email: auth.email,
        isVerified: auth.isVerified,
        isApproved: auth.isApproved,
        isBlocked: auth.isBlocked,
        locationPreference: user.locationPreference,
    };
    if (auth.role === enums_1.Role.CREATOR || auth.role === enums_1.Role.ADMIN) {
        [error, creator] = await (0, await_to_ts_1.default)(creator_1.default.findOne({ auth: auth._id }));
        if (error || !creator)
            return null;
        data.creatorId = creator._id.toString();
    }
    if (auth.role === enums_1.Role.ADMIN) {
        [error, admin] = await (0, await_to_ts_1.default)(admin_1.default.findOne({ auth: auth._id }));
        if (error || !admin)
            return null;
        data.adminId = admin._id.toString();
    }
    return data;
};
exports.getUserInfo = getUserInfo;
const hasAccess = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!roles.includes(user.role))
            return next((0, http_errors_1.default)(http_status_1.default.FORBIDDEN, "Access Denied. You don't have sufficient permission"));
        // if (!user.isApproved)
        //   return next(
        //     createError(
        //       httpStatus.FORBIDDEN,
        //       "Access Denied. Wait for Admin's approval.",
        //     ),
        //   );
        if (user.isBlocked)
            return next((0, http_errors_1.default)(http_status_1.default.FORBIDDEN, "Access Denied. You have been blocked by the admin"));
        return next();
    };
};
const authorizeToken = (secret, errorMessage) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return next((0, http_errors_1.default)(401, "Not Authorized"));
        }
        const token = authHeader.split(" ")[1];
        if (!secret) {
            return next((0, http_errors_1.default)(500, "JWT secret is not defined."));
        }
        const [error, decoded] = (0, jwt_1.decodeToken)(token, secret);
        if (error)
            return next(error);
        if (!decoded)
            return next((0, http_errors_1.default)(401, errorMessage));
        const data = await (0, exports.getUserInfo)(decoded.id);
        if (!data)
            return next((0, http_errors_1.default)(404, "User Not Found"));
        if (data.isBlocked)
            return next((0, http_errors_1.default)(403, "You are blocked"));
        req.user = data;
        console.log(data);
        return next();
    };
};
exports.authorize = authorizeToken(process.env.JWT_ACCESS_SECRET, "Invalid Token");
exports.refreshAuthorize = authorizeToken(process.env.JWT_REFRESH_SECRET, "Invalid Refresh Token");
exports.recoveryAuthorize = authorizeToken(process.env.JWT_RECOVERY_SECRET, "Invalid Recovery Token");
exports.isAdmin = hasAccess([enums_1.Role.ADMIN]);
exports.isCreator = hasAccess([enums_1.Role.CREATOR]);
exports.isUserOrCreator = hasAccess([enums_1.Role.USER, enums_1.Role.CREATOR]);
exports.isAdminOrCreator = hasAccess([enums_1.Role.ADMIN, enums_1.Role.CREATOR]);
