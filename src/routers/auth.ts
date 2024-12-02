import AuthController from "@controllers/auth";
import express from "express";
import { authorize, isUserOrCreator, recoveryAuthorize, refreshAuthorize } from "@middlewares/authorization";
import { validateRegisterInput } from "@middlewares/validation";

const router = express.Router();

router.post("/register", validateRegisterInput, AuthController.register);
router.post("/activate", AuthController.activate);
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/change-password", recoveryAuthorize, AuthController.changePassword);
router.post("/refresh", refreshAuthorize, AuthController.getAccessToken);
router.delete("/delete", authorize, isUserOrCreator, AuthController.remove);

export default router;
