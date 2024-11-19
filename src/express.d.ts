import { Request } from "express";
import { Types } from "mongoose";
import { DecodedUser } from "@models/user";

declare global {
  namespace Express {
    interface Request {
      user: DecodedUser;
    }
  }
}
