import CreatorController from "@controllers/creator";
import express from "express";
import { authorize, isCreator } from "@middlewares/authorization";

const router = express.Router();

router.post("/delete", authorize, isCreator, CreatorController.remove);

export default router;
