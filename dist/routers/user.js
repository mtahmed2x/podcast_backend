"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../controllers/user"));
const router = express_1.default.Router();
const authorization_1 = require("../middlewares/authorization");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileHandler_1 = __importDefault(require("../middlewares/fileHandler"));
router.get("/", authorization_1.authorize, user_1.default.get);
router.put("/update", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, user_1.default.update);
router.post("/update-location", authorization_1.authorize, user_1.default.updateLocation);
exports.default = router;
