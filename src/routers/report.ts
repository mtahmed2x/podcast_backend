import reportController from "@controllers/report";
import express from "express";
const router = express.Router();

router.get("/", reportController.get);

export default router;
