import AuthController from "@controllers/auth";
import express from "express";
import { authorize, isUserOrCreator, refreshAuthorize } from "@middlewares/authorization";
import DashboardController from "@controllers/dashboard";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/activate", AuthController.activate);
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-otp", AuthController.verifyOTP);
router.put("/reset-password", AuthController.resetPassword);
router.put("/change-password", authorize, isUserOrCreator, DashboardController.changePassword);
router.delete("/delete", authorize, isUserOrCreator, AuthController.remove);
router.post("/refresh", refreshAuthorize, AuthController.getAccessToken);

export default router;
