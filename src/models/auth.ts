import { Document, Schema, model } from "mongoose";
import Creator from "@models/creator";
import User from "@models/user";
import { AuthValidatorSchema } from "@validator/input";
import { z } from "zod";
import { Role } from "@shared/enums";

export type AuthSchema = z.infer<typeof AuthValidatorSchema> & Document;

const authSchema = new Schema<AuthSchema>(
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
      enum: Role,
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
    subscriptionType: {
      type: String,
      default: "free",
    },
  },
  { timestamps: true }
);

authSchema.pre("findOneAndDelete", async function (next) {
  const auth = await this.model.findOne(this.getQuery());
  if (auth) {
    await User.deleteOne({ authId: auth._id });
    await Creator.deleteOne({ authId: auth._id });
  }
  next();
});

const Auth = model<AuthSchema>("Auth", authSchema);
export default Auth;
