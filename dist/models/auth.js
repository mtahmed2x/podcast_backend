"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const enums_1 = require("../shared/enums");
const creator_1 = __importDefault(require("./creator"));
const user_1 = __importDefault(require("./user"));
const authSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: enums_1.Role,
    },
    verificationOTP: {
        type: String,
        required: false,
    },
    verificationOTPExpire: {
        type: Date,
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
authSchema.pre("findOneAndDelete", async function (next) {
    const auth = await this.model.findOne(this.getQuery());
    if (auth) {
        await user_1.default.deleteOne({ authId: auth._id });
        await creator_1.default.deleteOne({ authId: auth._id });
    }
    next();
});
const Auth = (0, mongoose_1.model)("Auth", authSchema);
exports.default = Auth;
