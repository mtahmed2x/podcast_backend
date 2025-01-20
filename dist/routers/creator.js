"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const creator_1 = __importDefault(require("../controllers/creator"));
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.get("/top-creators", authorization_1.authorize, creator_1.default.topCreators);
router.get("/all-podcasts", authorization_1.authorize, authorization_1.isCreator, creator_1.default.getAllPodcasts);
exports.default = router;
