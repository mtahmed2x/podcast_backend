"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = __importDefault(require("../controllers/search"));
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/podcasts", search_1.default.searchPodcasts);
router.get("/categories", search_1.default.searchCategories);
router.get("/subcategories/:id", search_1.default.searchSubCategories);
exports.default = router;
