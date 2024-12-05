import express from "express";
import LikeController from "@controllers/like";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.post("/:id", authorize, LikeController.likeToggle);

export default router;
