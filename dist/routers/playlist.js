"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playlist_1 = __importDefault(require("../controllers/playlist"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create", authorization_1.authorize, playlist_1.default.create);
router.get("/:id", authorization_1.authorize, playlist_1.default.get);
router.get("/", authorization_1.authorize, playlist_1.default.getAll);
router.put("/update/:id", authorization_1.authorize, playlist_1.default.update);
router.delete("/delete/:id", authorization_1.authorize, playlist_1.default.remove);
router.get("/:id/podcasts", authorization_1.authorize, playlist_1.default.getPodcast);
router.post("/:id/add-podcasts", authorization_1.authorize, playlist_1.default.addPodcast);
router.post("/:id/remove-podcasts", authorization_1.authorize, playlist_1.default.removePodcast);
exports.default = router;
