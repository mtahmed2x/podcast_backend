import FaqController from "@controllers/faq";
import express from "express";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/add", authorize, isAdmin, FaqController.add);
router.get("/", authorize, FaqController.getAll);
router.put("/update/:id", authorize, isAdmin, FaqController.update);
router.delete("/delete/:id", authorize, isAdmin, FaqController.remove);

export default router;
