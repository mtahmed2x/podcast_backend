import express from "express";
import WebHookController from "@controllers/stripe-webhook";
import bodyParser from "body-parser";

const router = express.Router();
router.post("/webhook", bodyParser.raw({ type: "application/json" }), WebHookController.webhook);
export default router;
