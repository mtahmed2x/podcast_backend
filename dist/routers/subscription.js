"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = __importDefault(require("../controllers/subscription"));
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create/:id", authorization_1.authorize, subscription_1.default.create);
router.get("/", authorization_1.authorize, subscription_1.default.get);
router.post("/cancel", authorization_1.authorize, subscription_1.default.cancel);
exports.default = router;
