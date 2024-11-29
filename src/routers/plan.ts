import express from "express";
import PlanController from "@controllers/plan";

const router = express.Router();

router.post("/create", PlanController.create);
router.get("/", PlanController.getAll);
router.get("/:id", PlanController.get);
router.put("/edit/:id", PlanController.update);

export default router;
