import SubCategoryController from "@controllers/subCategory";
import express from "express";
const router = express.Router();

router.post("/create", SubCategoryController.create);
router.get("/", SubCategoryController.getAll);
router.get("/:id", SubCategoryController.getById);
router.put("/update/:id", SubCategoryController.update);
router.delete("/delete/:id", SubCategoryController.remove);
router.get("/:id/podcasts", SubCategoryController.getAllPodcasts);

export default router;
