import TermController from "@controllers/term";
import express from "express";
const router = express.Router();

router.post("/add", TermController.add);

export default router;
