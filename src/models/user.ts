import { UserSchema } from "@type/schema";
import { Schema, model } from "mongoose";

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
      type: "String",
      required: true,
    },
    gender: {
      type: String,
    },
    contact: {
      type: "String",
    },
    address: {
      type: "String",
      required: true,
    },
  },
  { timestamps: true }
);

const User = model<UserSchema>("User", userSchema);
export default User;
