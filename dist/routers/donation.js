"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const donation_1 = __importDefault(require("../controllers/donation"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post("/create", authorization_1.authorize, authorization_1.isCreator, donation_1.default.create);
router.get("/:id", authorization_1.authorize, donation_1.default.get);
router.get("/", authorization_1.authorize, donation_1.default.getAll);
router.put("/update", authorization_1.authorize, authorization_1.isCreator, donation_1.default.update);
router.delete("/delete", authorization_1.authorize, authorization_1.isCreator, donation_1.default.remove);
exports.default = router;
