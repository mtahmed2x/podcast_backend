"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favorite_1 = __importDefault(require("../controllers/favorite"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/toggle", authorization_1.authorize, favorite_1.default.toggle);
router.get("/", authorization_1.authorize, favorite_1.default.get);
exports.default = router;
