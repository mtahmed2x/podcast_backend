import SubscriptionController from "@controllers/subscription";
import express from "express";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.post("/create/:id", authorize, SubscriptionController.create);
router.get("/", authorize, SubscriptionController.get);
router.post("/cancel", authorize, SubscriptionController.cancel);

export default router;
