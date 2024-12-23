import express from "express";
import CategoryController from "@controllers/category";
import { authorize, isAdmin } from "@middlewares/authorization";
import { ParamValidator } from "@middlewares/validation";
import { handleFileUpload } from "@middlewares/uploadFile";

const CategoryRouter = express.Router();

CategoryRouter.post("/create", authorize, isAdmin, handleFileUpload, CategoryController.create);
CategoryRouter.get("/", authorize, CategoryController.getAll);
CategoryRouter.get("/:id", authorize, ParamValidator, CategoryController.get);
CategoryRouter.put("/update/:id", authorize, isAdmin, ParamValidator, CategoryController.update);
CategoryRouter.delete("/delete/:id", authorize, isAdmin, ParamValidator, CategoryController.remove);
CategoryRouter.get(
    "/:id/sub-categories",
    authorize,
    ParamValidator,
    CategoryController.getSubCategories,
);
CategoryRouter.get("/:id/podcasts", authorize, ParamValidator, CategoryController.getPodcasts);

export default CategoryRouter;
