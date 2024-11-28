import express from "express";
import AboutController from "@controllers/about";
const router = express.Router();

router.post("/add", AboutController.add);
router.get("/", AboutController.get);
router.put("/update/:id", AboutController.update);

export default router;
