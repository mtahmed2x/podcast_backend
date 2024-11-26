import FaqController from "@controllers/faq";
import express from "express";
const router = express.Router();

router.post("/add", FaqController.add);

export default router;
