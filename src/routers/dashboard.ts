import express from "express";
import DashboardController from "@controllers/dashboard";

const router = express.Router();

router.get("/all-users", DashboardController.displayAllUsers);
router.get("/all-creators", DashboardController.displayAllCreators);

export default router;
