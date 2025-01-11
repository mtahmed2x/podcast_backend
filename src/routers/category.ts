import express from "express";
import CategoryController from "@controllers/category";
import { authorize, isAdmin } from "@middlewares/authorization";
import { handleFileUpload } from "@middlewares/uploadFile";
import fileUpload from "express-fileupload";
import fileHandler from "@middlewares/fileHandler";

const CategoryRouter = express.Router();

CategoryRouter.post(
  "/create",
  fileUpload(),
  fileHandler,
  authorize,
  isAdmin,
  CategoryController.create,
);
CategoryRouter.get("/", authorize, CategoryController.getAll);
CategoryRouter.get("/:id", authorize, CategoryController.get);
CategoryRouter.put(
  "/update/:id",
  fileUpload(),
  fileHandler,
  authorize,
  isAdmin,
  CategoryController.update,
);
CategoryRouter.delete("/delete/:id", authorize, isAdmin, CategoryController.remove);
CategoryRouter.get(
  "/:id/sub-categories",
  authorize,

  CategoryController.getSubCategories,
);
CategoryRouter.get("/:id/podcasts", authorize, CategoryController.getPodcasts);

export default CategoryRouter;
