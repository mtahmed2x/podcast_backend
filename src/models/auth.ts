import { Document, Schema, model } from "mongoose";

export type AuthDocument = Document & {
  email: string;
  password: string;
  role: "user" | "admin" | "creator";
  verificationOTP: string;
  verificationOTPExpire: Date | null;
  isVerified: boolean;
  isBlocked: boolean;
};

const authSchema = new Schema<AuthDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
    },
    verificationOTP: {
      type: String,
      required: false,
    },
    verificationOTPExpire: {
      type: Date,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Auth = model<AuthDocument>("Auth", authSchema);
export default Auth;
