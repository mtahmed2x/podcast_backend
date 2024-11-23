import express from "express";
import PlanController from "@controllers/plan";

const router = express.Router();

router.post("/create", PlanController.create);
router.get("/", PlanController.displayAll);
router.get("/:id", PlanController.displayById);
router.put("/edit/:id", PlanController.update);

export default router;
