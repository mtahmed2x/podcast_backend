"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const history_1 = __importDefault(require("../controllers/history"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.get("/", authorization_1.authorize, history_1.default.get);
router.delete("/delete/:id", history_1.default.remove);
exports.default = router;
