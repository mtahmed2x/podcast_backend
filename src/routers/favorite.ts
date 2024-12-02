import express from "express";
import FavoriteController from "@controllers/favorite";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.post("/toggle", authorize, FavoriteController.toggle);
router.get("/", authorize, FavoriteController.get);

export default router;
