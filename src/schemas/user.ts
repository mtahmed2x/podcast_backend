import { Document, Types } from "mongoose";
import { Gender } from "@shared/enums";

export type UserSchema = Document & {
  auth: Types.ObjectId;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  contact: string;
  address: string;
  avatar: string;
};
