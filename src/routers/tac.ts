import express from "express";
import TaCController from "@controllers/tac";
const router = express.Router();

router.post("/add", TaCController.add);
router.get("/", TaCController.get);
router.put("/update/:id", TaCController.update);

export default router;
