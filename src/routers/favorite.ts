import express from "express";
import FavoriteController from "@controllers/favorite";
const router = express.Router();

router.post("/toggle", FavoriteController.toggle);
router.get("/", FavoriteController.get);

export default router;
