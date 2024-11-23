import SubScriptionController from "@controllers/subscription";
import express from "express";

const router = express.Router();

router.post("/checkout", SubScriptionController.checkout);

export default router;
