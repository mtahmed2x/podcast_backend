import express from "express";
import { authorize, isAdmin } from "@middlewares/authorization";
import getAnalyticsByYear from "@controllers/analytics";

const router = express.Router();

router.get("/:year", authorize, isAdmin, getAnalyticsByYear);

export default router;
