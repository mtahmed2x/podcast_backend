import FaqController from "@controllers/faq";
import express from "express";
const router = express.Router();

router.post("/add", FaqController.add);
router.get("/", FaqController.getAll);
router.put("/update/:id", FaqController.update);
router.delete("/delete/:id", FaqController.remove);

export default router;
