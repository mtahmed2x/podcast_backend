"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const audioDirectory = "uploads/podcast/audio";
const coverDirectory = "uploads/podcast/cover";
const avatarDirectory = "uploads/profile/avatar";
const categoryDirectory = "uploads/category/image";
const subCategoryDirectory = "uploads/sub-category/image";
const ensureDirectoryExists = (directory) => {
    if (!fs_1.default.existsSync(directory)) {
        fs_1.default.mkdirSync(directory, { recursive: true });
    }
};
ensureDirectoryExists(audioDirectory);
ensureDirectoryExists(coverDirectory);
ensureDirectoryExists(avatarDirectory);
ensureDirectoryExists(categoryDirectory);
ensureDirectoryExists(subCategoryDirectory);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "audio") {
            cb(null, audioDirectory);
        }
        else if (file.fieldname === "cover") {
            cb(null, coverDirectory);
        }
        else if (file.fieldname === "avatar") {
            cb(null, avatarDirectory);
        }
        else if (file.fieldname === "categoryImage") {
            cb(null, categoryDirectory);
        }
        else if (file.fieldname === "subCategoryImage") {
            cb(null, subCategoryDirectory);
        }
        else {
            cb(new Error("Invalid file field"), "");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        audio: /mp3|wav|m4a|mpeg|audio\/mp4/,
        cover: /jpeg|jpg|png|gif|webp/,
        avatar: /jpeg|jpg|png|gif/,
        categoryImage: /jpeg|jpg|png|gif|webp/,
        subCategoryImage: /jpeg|jpg|png|gif|webp/,
    };
    const allowedType = allowedTypes[file.fieldname];
    if (allowedType) {
        const extname = allowedType.test(path_1.default.extname(file.originalname).toLowerCase());
        console.log(file.mimetype);
        const mimetype = allowedType.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error(`Only ${file.fieldname} files are allowed!`));
        }
    }
    else {
        cb(new Error("Invalid file field"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 1000 * 1024 * 1024,
    },
});
const uploadMiddleware = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "categoryImage", maxCount: 1 },
    { name: "subCategoryImage", maxCount: 1 },
]);
const handleFileUpload = (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ error: err.message });
        }
        else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};
exports.handleFileUpload = handleFileUpload;
