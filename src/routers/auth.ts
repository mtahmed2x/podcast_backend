import AuthController from "@controllers/auth";
import express from "express";
import { authorize, recoveryAuthorize } from "@middlewares/authorization";
import { validateRegisterInput } from "@middlewares/validator";

const authRouter = express.Router();

authRouter.post("/register", validateRegisterInput, AuthController.register);
authRouter.post("/activate", AuthController.activate);
authRouter.post("/login", AuthController.login);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/verify-otp", AuthController.verifyOTP);
authRouter.post("/change-password", recoveryAuthorize, AuthController.changePassword);

export default authRouter;
