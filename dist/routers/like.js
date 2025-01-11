"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const like_1 = __importDefault(require("../controllers/like"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/:id", authorization_1.authorize, like_1.default.likeToggle);
exports.default = router;
