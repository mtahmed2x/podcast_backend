import AuthController from "@controllers/auth";
import express from "express";
import { authorize } from "@middlewares/authorization";
import { validateRegisterInput } from "@middlewares/validator";

const authRouter = express.Router();

authRouter.post("/register", validateRegisterInput, AuthController.register);
authRouter.post("/activate", AuthController.activate);
authRouter.post("/login", AuthController.login);
authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/recover-password", AuthController.recoverPassword);
authRouter.post("/change-password", authorize, AuthController.changePassword);

export default authRouter;
