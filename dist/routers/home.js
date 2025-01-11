"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const home_1 = __importDefault(require("../controllers/home"));
const authorization_1 = require("../middlewares/authorization");
router.get("/", authorization_1.authorize, home_1.default);
exports.default = router;
