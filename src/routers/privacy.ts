import express from "express";
import PrivacyController from "@controllers/privacy";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/add", authorize, isAdmin, PrivacyController.add);
router.get("/", authorize, PrivacyController.get);
router.put("/update/:id", authorize, isAdmin, PrivacyController.update);

export default router;
