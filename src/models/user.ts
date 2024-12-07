import { UserSchema } from "@schemas/user";
import { Schema, model } from "mongoose";
import { Gender } from "@shared/enums";

const userSchema = new Schema<UserSchema>(
  {
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: Gender,
      default: null,
    },
    contact: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = model<UserSchema>("User", userSchema);
export default User;
