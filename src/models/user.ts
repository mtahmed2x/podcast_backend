import { UserSchema } from "@schemas/user";
import { Schema, model } from "mongoose";
import { Gender, Subject } from "@shared/enums";

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
    },
    contact: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    backgroundImage: {
      type: String,
      default: "",
    },
    locationPreference: {
      type: String,
      default: "",
    },
    notification: [
      {
        subject: {
          type: String,
          enum: Subject,
          required: true,
        },
        podcast: {
          type: Schema.Types.ObjectId,
          required: false,
        },
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          required: true,
        },
        updatedAt: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true },
);

const User = model<UserSchema>("User", userSchema);
export default User;
