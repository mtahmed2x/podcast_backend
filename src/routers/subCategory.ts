import SubCategoryController from "@controllers/subCategory";
import express from "express";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", authorize, isAdmin, SubCategoryController.create);
router.get("/", authorize, SubCategoryController.getAll);
router.get("/:id", authorize, SubCategoryController.get);
router.put("/update/:id", authorize, isAdmin, SubCategoryController.update);
router.delete("/delete/:id", authorize, isAdmin, SubCategoryController.remove);
router.get("/:id/podcasts", authorize, SubCategoryController.getPodcasts);

export default router;
