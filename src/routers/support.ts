import express from "express";
import SupportController from "@controllers/support";
import { authorize, isAdmin } from "@middlewares/authorization";
const router = express.Router();

router.post("/create", authorize, isAdmin, SupportController.create);
router.get("/", authorize, SupportController.get);
router.put("/update/:id", authorize, isAdmin, SupportController.update);

export default router;
