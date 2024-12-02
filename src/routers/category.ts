import express from "express";
import CategoryController from "@controllers/category";
import { authorize, isAdmin } from "@middlewares/authorization";

const CategoryRouter = express.Router();

CategoryRouter.post("/create", authorize, isAdmin, CategoryController.create);
CategoryRouter.get("/", authorize, CategoryController.getAll);
CategoryRouter.get("/:id", authorize, CategoryController.get);
CategoryRouter.put("/update/:id", authorize, isAdmin, CategoryController.update);
CategoryRouter.delete("/delete/:id", authorize, isAdmin, CategoryController.remove);
CategoryRouter.get("/:id/sub-categories", authorize, CategoryController.getSubCategories);
// CategoryRouter.get("/:id/podcasts", CategoryController.getAllPodcasts);

export default CategoryRouter;
