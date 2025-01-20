"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileHandler = void 0;
const cloudinary_1 = __importDefault(require("../shared/cloudinary"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const uploadFileToCloudinary = async (file, folder) => {
    try {
        return await cloudinary_1.default.upload(file, folder);
    }
    catch (error) {
        throw new Error(`Failed to upload ${folder} file: ${error.message}`);
    }
};
const fileHandler = async (req, res, next) => {
    try {
        const fileFields = [
            { fieldName: "avatar", folder: "profile", key: "avatarUrl" },
            { fieldName: "backgroundImage", folder: "profile", key: "backgroundImageUrl" },
            { fieldName: "categoryImage", folder: "category", key: "categoryImageUrl" },
            { fieldName: "subcategoryImage", folder: "subcategory", key: "subcategoryImageUrl" },
            { fieldName: "cover", folder: "cover", key: "coverUrl" },
            { fieldName: "audio", folder: "audio", key: "podcastAudioUrl" },
        ];
        if (req.files) {
            await Promise.all(fileFields.map(async ({ fieldName, folder, key }) => {
                const file = req.files[fieldName];
                if (file) {
                    const fileUrl = await uploadFileToCloudinary(file, folder);
                    req.body[key] = fileUrl;
                }
            }));
        }
        next();
    }
    catch (error) {
        next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, error.message));
    }
};
exports.fileHandler = fileHandler;
exports.default = exports.fileHandler;
