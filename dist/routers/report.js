"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const report_1 = __importDefault(require("../controllers/report"));
const authorization_1 = require("../middlewares/authorization");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/create", authorization_1.authorize, authorization_1.isUserOrCreator, report_1.default.create);
router.get("/", authorization_1.authorize, authorization_1.isAdmin, report_1.default.get);
exports.default = router;
