"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subCategory_1 = __importDefault(require("../controllers/subCategory"));
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileHandler_1 = __importDefault(require("../middlewares/fileHandler"));
const router = express_1.default.Router();
router.post("/create", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, authorization_1.isAdmin, subCategory_1.default.create);
router.get("/", authorization_1.authorize, subCategory_1.default.getAll);
router.get("/:id", authorization_1.authorize, subCategory_1.default.get);
router.put("/update/:id", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, authorization_1.isAdmin, subCategory_1.default.update);
router.delete("/delete/:id", authorization_1.authorize, authorization_1.isAdmin, subCategory_1.default.remove);
router.get("/:id/podcasts", authorization_1.authorize, subCategory_1.default.getPodcasts);
exports.default = router;
