import express from "express";
import PlanController from "@controllers/plan";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", PlanController.create);
router.get("/", authorize, isAdmin, PlanController.getAll);
router.get("/:id", authorize, isAdmin, PlanController.get);
router.put("/edit/:id", authorize, isAdmin, PlanController.update);

export default router;
