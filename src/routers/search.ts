import searchController from "@controllers/search";
import { Router } from "express";

const router = Router();

router.get("/podcasts", searchController.searchPodcasts);
router.get(
  "/categories",
  searchController.searchCategories,
);
router.get(
  "/subcategories",
  searchController.searchSubCategories,
);

export default router;
