import express from "express";
import HistoryController from "@controllers/history";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.get("/", authorize, HistoryController.get);
router.delete("/delete/:id", HistoryController.remove);

export default router;
