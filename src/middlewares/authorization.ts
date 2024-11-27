import to from "await-to-ts";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

import Auth from "@models/auth";
import User from "@models/user";
import Creator from "@models/creator";
import Admin from "@models/admin";
import { DecodedUser } from "@type/schema";

type Decoded = {
  id: string;
};

export const decode = async (
  token: string
): Promise<[Error | null, DecodedUser | null]> => {
  let error, auth, user, creator, admin;

  let decoded: Decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as Decoded;
  } catch (err) {
    return [err as Error, null];
  }

  [error, auth] = await to(
    Auth.findById(decoded.id).select("email role isVerified isBlocked")
  );
  if (error) return [error, null];
  if (!auth) {
    error = createError(404, "User Not Found");
    return [error, null];
  }

  [error, user] = await to(User.findOne({ auth: auth._id }));
  if (error) return [error, null];
  if (!user) {
    error = createError(404, "User Not Found");
    return [error, null];
  }

  const data: DecodedUser = {
    authId: auth._id!.toString(),
    email: auth.email,
    role: auth.role,
    isVerified: auth.isVerified,
    isBlocked: auth.isBlocked,
    userId: user._id!.toString(),
    name: user.name,
  };

  if (auth.role === "CREATOR") {
    [error, creator] = await to(Creator.findOne({ auth: auth._id }));
    if (error) return [error, null];
    if (!creator) {
      error = createError(404, "User Not Found");
      return [error, null];
    }
    data.creatorId = creator._id!.toString();
  }
  if (auth.role === "ADMIN") {
    [error, admin] = await to(Admin.findOne({ auth: auth._id }));
    if (error) return [error, null];
    if (!admin) {
      error = createError(404, "Admin Not Found");
      return [error, null];
    }
    data.adminId = admin._id!.toString();
  }
  return [null, data];
};

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(createError(401, "Not Authorized"));
  }
  const token = authHeader.split(" ")[1];
  const [error, data] = await decode(token);
  if (error) return next(error);
  if (data) req.user = data;
  next();
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;
  if (user.role === "ADMIN") return next();
  return next(createError(403, "Access Denied. Only Admin Allowed"));
};

export const isCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;
  if (user.role === "CREATOR") return next();
  return next(createError(403, "Access Denied. Only Creator Allowed"));
};
