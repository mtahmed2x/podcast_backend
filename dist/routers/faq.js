"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faq_1 = __importDefault(require("../controllers/faq"));
const express_1 = __importDefault(require("express"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/add", authorization_1.authorize, authorization_1.isAdmin, faq_1.default.add);
router.get("/", authorization_1.authorize, faq_1.default.get);
router.put("/update/:id", authorization_1.authorize, authorization_1.isAdmin, faq_1.default.update);
router.delete("/delete/:id", authorization_1.authorize, authorization_1.isAdmin, faq_1.default.remove);
exports.default = router;
