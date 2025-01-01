import express from "express";
import AboutController from "@controllers/about";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/add", authorize, isAdmin, AboutController.add);
router.get("/", authorize, AboutController.get);
router.put("/update/:id", authorize, isAdmin, AboutController.update);

export default router;
