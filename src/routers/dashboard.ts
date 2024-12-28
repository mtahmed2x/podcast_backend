import express from "express";
import DashboardController from "@controllers/dashboard";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.get("/all-users", authorize, isAdmin, DashboardController.displayAllUsers);
router.get("/all-creators", authorize, isAdmin, DashboardController.displayAllCreators);
router.get("/admin", authorize, isAdmin, DashboardController.adminProfile);
router.post("/login", DashboardController.login);
router.put("/update", authorize, isAdmin, DashboardController.updateProfile);
router.put("/change-password", authorize, isAdmin, DashboardController.changePassword);
router.post("/block/:id", authorize, isAdmin, DashboardController.block);
router.post("/unblock/:id", authorize, isAdmin, DashboardController.unblock);
router.post("/approve/:id", authorize, isAdmin, DashboardController.unblock);
router.get("/income", authorize, isAdmin, DashboardController.incomeByMonth);
router.get("/total-subscriber", authorize, isAdmin, DashboardController.totalSubscriber);
router.get("/subscriber", authorize, isAdmin, DashboardController.subscribersByMonth);
router.get("/search-creators", authorize, isAdmin, DashboardController.searchCreatorsByName);
router.get("/search-users", authorize, isAdmin, DashboardController.searchUsersByName);

export default router;
