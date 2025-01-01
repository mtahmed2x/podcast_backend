import reportController from "@controllers/report";
import {
  authorize,
  isAdmin,
  isUserOrCreator,
} from "@middlewares/authorization";
import express from "express";
const router = express.Router();

router.post("/create", authorize, isUserOrCreator, reportController.create);
router.get("/", authorize, isAdmin, reportController.get);

export default router;
