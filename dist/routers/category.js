"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_1 = __importDefault(require("../controllers/category"));
const authorization_1 = require("../middlewares/authorization");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileHandler_1 = __importDefault(require("../middlewares/fileHandler"));
const CategoryRouter = express_1.default.Router();
CategoryRouter.post("/create", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, authorization_1.isAdmin, category_1.default.create);
CategoryRouter.get("/", authorization_1.authorize, category_1.default.getAll);
CategoryRouter.get("/:id", authorization_1.authorize, category_1.default.get);
CategoryRouter.put("/update/:id", (0, express_fileupload_1.default)(), fileHandler_1.default, authorization_1.authorize, authorization_1.isAdmin, category_1.default.update);
CategoryRouter.delete("/delete/:id", authorization_1.authorize, authorization_1.isAdmin, category_1.default.remove);
CategoryRouter.get("/:id/sub-categories", authorization_1.authorize, category_1.default.getSubCategories);
CategoryRouter.get("/:id/podcasts", authorization_1.authorize, category_1.default.getPodcasts);
exports.default = CategoryRouter;
