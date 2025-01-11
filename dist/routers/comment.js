"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = __importDefault(require("../controllers/comment"));
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/:id", authorization_1.authorize, comment_1.default.addComment);
router.get("/:id", authorization_1.authorize, comment_1.default.get);
exports.default = router;
