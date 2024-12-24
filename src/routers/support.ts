import express from "express";
import SupportController from "@controllers/support";
const router = express.Router();

router.post("/add", SupportController.add);
router.get("/", SupportController.get);
router.put("/update/:id", SupportController.update);

export default router;
