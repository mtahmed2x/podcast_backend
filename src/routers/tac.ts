import express from "express";
import TaCController from "@controllers/tac";
import { authorize, isAdmin } from "@middlewares/authorization";
const router = express.Router();

router.post("/add", authorize, isAdmin, TaCController.add);
router.get("/", authorize, TaCController.get);
router.put("/update/:id", authorize, isAdmin, TaCController.update);

export default router;
