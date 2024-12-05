import AuthController from "@controllers/auth";
import express from "express";
import { authorize, isUserOrCreator, recoveryAuthorize, refreshAuthorize } from "@middlewares/authorization";
import { emailValidator, otpValidator, passwordValidator, validateRegisterInput } from "@middlewares/validation";
import DashboardController from "@controllers/dashboard";

const router = express.Router();

router.post("/register", validateRegisterInput, AuthController.register);
router.post("/activate", emailValidator, otpValidator, AuthController.activate);
router.post("/login", emailValidator, AuthController.login);
router.post("/forgot-password", emailValidator, AuthController.forgotPassword);
router.post("/verify-otp", emailValidator, otpValidator, AuthController.verifyOTP);
router.put("/reset-password", passwordValidator, recoveryAuthorize, AuthController.resetPassword);
router.put("/change-password", passwordValidator, authorize, DashboardController.changePassword);
router.delete("/delete", authorize, isUserOrCreator, AuthController.remove);
router.post("/refresh", refreshAuthorize, AuthController.getAccessToken);

export default router;
