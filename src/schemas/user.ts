import { Document, Types } from "mongoose";
import { Gender, Subject } from "@shared/enums";

export type UserSchema = Document & {
  auth: Types.ObjectId;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  contact: string;
  address: string;
  avatar: string;
  backgroundImage: string;
  locationPreference: string;
  notification: {
    subject: Subject;
    podcast?: Types.ObjectId;
    message: string;
    createdAt: Date;
    updatedAt?: Date;
  }[];
};
