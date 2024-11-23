import CreatorController from "@controllers/creator";
import express from "express";

const router = express.Router();

router.post("/delete", CreatorController.remove);

export default router;
