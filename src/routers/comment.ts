import CommentController from "@controllers/comment";
import express from "express";
import { authorize, isCreator } from "@middlewares/authorization";

const router = express.Router();

router.post("/:id", authorize, CommentController.addComment);
router.get("/:id", authorize, CommentController.get);

export default router;
