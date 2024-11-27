import { Role } from "@shared/enums";
import { Document, Types } from "mongoose";

export type AuthSchema = Document & {
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  verificationOTP: string;
  verificationOTPExpire: Date | null;
  isVerified: boolean;
  isBlocked: boolean;
  subscriptionType: string;
};

export type AdminSchema = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
};

export type CreatorSchema = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
  podcasts: Types.ObjectId[];
};

export type UserSchema = Document & {
  auth: Types.ObjectId;
  name: string;
  dateOfBirth: string;
  gender: string;
  contact: string;
  address: string;
};

export type DecodedUser = {
  authId: string;
  userId: string;
  name: string;
  isVerified: boolean;
  isBlocked: boolean;
  email: string;
  role: Role;
  creatorId?: string;
  adminId?: string;
};

export type CategorySchema = Document & {
  title: string;
  subCategories: Types.ObjectId[];
};
