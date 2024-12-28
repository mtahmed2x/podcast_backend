import to from "await-to-ts";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

import Auth from "@models/auth";
import User from "@models/user";
import Creator from "@models/creator";
import Admin from "@models/admin";

import { Role } from "@shared/enums";
import { decodeToken } from "@utils/jwt";
import { DecodedUser } from "@schemas/decodedUser";

export const getUserInfo = async (authId: string): Promise<DecodedUser | null> => {
  let error, auth, user, creator, admin;
  [error, auth] = await to(Auth.findById(authId).select("email role isVerified isBlocked"));
  if (error || !auth) return null;
  [error, user] = await to(User.findOne({ auth: authId }));
  if (error || !user) return null;

  const data: DecodedUser = {
    authId: auth._id!.toString(),
    email: auth.email,
    role: auth.role,
    isVerified: auth.isVerified,
    isBlocked: auth.isBlocked,
    userId: user._id!.toString(),
    name: user.name,
    locationPreference: user.locationPreference,
  };
  if (auth.role === Role.CREATOR) {
    [error, creator] = await to(Creator.findOne({ auth: auth._id }));
    if (error || !creator) return null;
    data.creatorId = creator._id!.toString();
  }
  if (auth.role === Role.ADMIN) {
    [error, admin] = await to(Admin.findOne({ auth: auth._id }));
    if (error || !admin) return null;
    data.adminId = admin._id!.toString();
  }
  return data;
};

const hasAccess = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    console.log(user);
    if (roles.includes(user.role as Role)) return next();
    return next(createError(403, "Access Denied."));
  };
};

const authorizeToken = (secret: string, errorMessage: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return next(createError(401, "Not Authorized"));
    }
    const token = authHeader.split(" ")[1];

    if (!secret) {
      return next(createError(500, "JWT secret is not defined."));
    }

    const [error, decoded] = decodeToken(token, secret);
    if (error) return next(error);
    if (!decoded) return next(createError(401, errorMessage));
    const data = await getUserInfo(decoded.id);
    if (!data) return next(createError(404, "User Not Found"));

    if (data.isBlocked) return next(createError(403, "You are blocked"));
    req.user = data;
    console.log(data);
    return next();
  };
};

export const authorize = authorizeToken(process.env.JWT_ACCESS_SECRET!, "Invalid Token");
export const refreshAuthorize = authorizeToken(
  process.env.JWT_REFRESH_SECRET!,
  "Invalid Refresh Token",
);
export const recoveryAuthorize = authorizeToken(
  process.env.JWT_RECOVERY_SECRET!,
  "Invalid Recovery Token",
);

export const isAdmin = hasAccess([Role.ADMIN]);
export const isCreator = hasAccess([Role.CREATOR]);
export const isUserOrCreator = hasAccess([Role.USER, Role.CREATOR]);
export const isAdminOrCreator = hasAccess([Role.ADMIN, Role.CREATOR]);
