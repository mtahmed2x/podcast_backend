import express from "express";
import DashboardController from "@controllers/dashboard";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.get("/all-users", DashboardController.displayAllUsers);
router.get("/all-creators", DashboardController.displayAllCreators);
router.get("/admin", authorize, isAdmin, DashboardController.adminProfile);
router.post("/login", DashboardController.login);
router.put("/update", authorize, isAdmin, DashboardController.updateProfile);
// router.put(
//   "/change-password",
//   authorize,
//   isAdmin,
//   DashboardController.changePassword
// );

export default router;
