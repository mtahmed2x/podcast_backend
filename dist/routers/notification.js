"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authorization_1 = require("../middlewares/authorization");
const express_1 = __importDefault(require("express"));
const notification_1 = __importDefault(require("../services/notification"));
const router = express_1.default.Router();
router.get("/", authorization_1.authorize, notification_1.default.get);
exports.default = router;
