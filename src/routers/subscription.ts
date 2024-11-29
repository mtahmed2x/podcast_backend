import SubScriptionController from "@controllers/subscription";
import express from "express";
import {authorize} from "@middlewares/authorization";

const router = express.Router();

router.post("/create", authorize, SubScriptionController.create)
router.get("/", authorize, SubScriptionController.get);
router.post("/upgrade/:id", authorize, SubScriptionController.upgrade);
router.post("/cancel", SubScriptionController.cancel);

export default router;
