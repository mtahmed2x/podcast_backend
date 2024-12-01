import express from "express";
import DashboardController from "@controllers/dashboard";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.get("/all-users", DashboardController.displayAllUsers);
router.get("/all-creators", DashboardController.displayAllCreators);
router.get("/admin", authorize, isAdmin, DashboardController.adminProfile);
router.post("/login", DashboardController.login);
router.put("/update", authorize, isAdmin, DashboardController.updateProfile);
router.put("/change-password", authorize, isAdmin, DashboardController.changePassword);
router.post("/block/:id", authorize, isAdmin, DashboardController.block);
router.post("/unblock/:id", authorize, isAdmin, DashboardController.unblock);
router.get("/income", DashboardController.incomeByMonth);
router.get("/total-subscriber", DashboardController.totalSubscriber);
router.get("/subscriber", DashboardController.subscribersByMonth);

export default router;
