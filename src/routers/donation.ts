import express from "express";
import DonationController from "@controllers/donation";
import { authorize, isCreator } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", authorize, isCreator, DonationController.create);
router.get("/:id", authorize, DonationController.get);
router.get("/", authorize, DonationController.getAll);
router.put("/update", authorize, isCreator, DonationController.update);
router.delete("/delete", authorize, isCreator, DonationController.remove);

export default router;
