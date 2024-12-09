import { Document } from "mongoose";
import { Role } from "@shared/enums";

export type AuthSchema = Document & {
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  verificationOTP: string;
  verificationOTPExpire: Date | null;
  isVerified: boolean;
  isBlocked: boolean;
};
