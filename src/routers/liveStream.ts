import express from "express";
import { authorize } from "@middlewares/authorization";
import LiveStreamController from "@controllers/liveStream";

const router = express.Router();

router.post("/start", authorize, LiveStreamController.start);
router.get("/", authorize, LiveStreamController.getAll);
router.post("/end", authorize, LiveStreamController.end);

export default router;
