import express from "express";
import CategoryController from "@controllers/category";

const CategoryRouter = express.Router();

CategoryRouter.post("/create", CategoryController.create);
CategoryRouter.get("/", CategoryController.getAll);
CategoryRouter.get("/:id", CategoryController.getById);
CategoryRouter.put("/update/:id", CategoryController.update);
CategoryRouter.delete("/delete/:id", CategoryController.remove);
CategoryRouter.get(
  "/:id/sub-categories",
  CategoryController.getAllSubCategories
);
// CategoryRouter.get("/:id/podcasts", CategoryController.getAllPodcasts);

export default CategoryRouter;
