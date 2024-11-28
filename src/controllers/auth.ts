import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import Auth from "@models/auth";
import {
  AuthSchema,
  AdminSchema,
  CreatorSchema,
  UserSchema,
} from "@type/schema";
import User from "@models/user";
import Creator from "@models/creator";
import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import handleError from "@utils/handleError";
import mongoose from "mongoose";
import createError from "http-errors";
import Admin from "@models/admin";
import { generateToken } from "@utils/jwt";

type Register = Pick<
  AuthSchema & UserSchema,
  | "email"
  | "password"
  | "confirmPassword"
  | "role"
  | "name"
  | "address"
  | "dateOfBirth"
>;

type Login = Pick<AuthSchema, "email" | "password">;

type UserPayload = {
  name: string;
  role: "admin" | "user" | "creator";
  dateOfBirth: string;
  address: string;
};

type VerifyEmailPayload = {
  email: string;
  verificationOTP: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ChangePasswordPayload = {
  password: string;
  confirmPassword?: string;
};

const register = async (
  req: Request<{}, {}, Register>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { name, email, role, dateOfBirth, address, password, confirmPassword } =
    req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  let error, auth, user;

  [error, auth] = await to(Auth.findOne({ email }));
  if (error) {
    return next(error);
  }
  if (auth) return next(createError(400, "Email already exists"));

  const verificationOTP = generateOTP();
  const verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  [error, auth] = await to(
    Auth.create({
      email,
      password: hashedPassword,
      role,
      verificationOTP: verificationOTP,
      verificationOTPExpire,
    })
  );
  if (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return next(error);
  }

  [error, user] = await to(
    User.create({
      auth: auth!._id,
      name: name,
      dateOfBirth: dateOfBirth,
      address: address,
    })
  );
  if (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }

  type ResponseData = [AuthSchema, UserSchema, CreatorSchema?, AdminSchema?];
  const responseData: ResponseData = [auth as AuthSchema, user as UserSchema];

  if (role === "CREATOR") {
    let creator;
    [error, creator] = await to(
      Creator.create({
        auth: auth._id,
        user: user._id,
      })
    );
    if (error) {
      await session.abortTransaction();
      session.endSession();
      return next(error);
    }

    responseData.push(creator);
  }

  if (role === "ADMIN") {
    let admin;
    [error, admin] = await to(
      Admin.create({
        auth: auth._id,
        user: user._id,
      })
    );
    if (error) {
      await session.abortTransaction();
      session.endSession();
      return next(error);
    }

    responseData.push(admin);
  }

  sendEmail(email, verificationOTP);

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Registration Successful. Verify your email.",
    data: responseData,
  });
};

const verifyEmail = async (
  payload: VerifyEmailPayload
): Promise<[Error | null, AuthSchema | null]> => {
  const { email, verificationOTP } = payload;
  let [error, auth] = await to(Auth.findOne({ email }));
  if (error) return [error, null];
  if (!auth) {
    error = new Error("Email don't exist");
    error.name = "NotFoundError";
    return [error, null];
  }
  if (auth && verificationOTP === auth.verificationOTP) return [null, auth];
  error = new Error("Wrong Verification Code");
  error.name = "UnauthorizedError";
  return [error, null];
};

const activate = async (
  req: Request<{}, {}, VerifyEmailPayload>,
  res: Response
): Promise<any> => {
  let [error, auth] = await verifyEmail(req.body);
  if (error) return handleError(error, res);

  if (auth) {
    auth.verificationOTP = "";
    auth.verificationOTPExpire = null;
    auth.isVerified = true;
    await auth.save();
    return res.status(200).json({ message: "Verification Successful" });
  }
};

const login = async (
  req: Request<{}, {}, Login>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { email, password } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(404, "Email don't exist"));

  const isPasswordValid = await bcrypt.compare(password, auth.password);
  if (!isPasswordValid) return next(createError(401, "Wrong password"));
  if (!auth.isVerified)
    return next(createError(401, "Verify your email first"));

  if (auth.isBlocked) return next(createError(403, "You are blocked"));

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!accessSecret || !refreshSecret) {
    return next(createError(500, "JWT secret is not defined."));
  }

  const accessToken = generateToken(auth._id!.toString(), accessSecret, "10m");
  const refreshToken = generateToken(
    auth._id!.toString(),
    refreshSecret,
    "96h"
  );

  return res
    .status(200)
    .json({ message: "Success", data: [accessToken, refreshToken] });
};

const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { email } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(404, "User Not Found"));
  const verificationOTP = generateOTP();
  auth.verificationOTP = verificationOTP;
  auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  await auth.save();
  sendEmail(email, verificationOTP);
  return res.status(200).json({ message: "Success. Verification mail sent." });
};

const verifyOTP = async (
  req: Request<{}, {}, VerifyEmailPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const [error, auth] = await verifyEmail(req.body);
  if (error) return handleError(error, res);
  if (auth) {
    const secret = process.env.JWT_RECOVERY_SECRET;
    if (!secret) {
      return next(createError(500, "JWT secret is not defined."));
    }
    const recoveryToken = generateToken(auth._id!.toString(), secret, "20m");
    res.status(200).json({ message: "Success", data: recoveryToken });
  }
};

const changePassword = async (
  req: Request<{}, {}, ChangePasswordPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return next(createError(401, "Passwords don't match"));
  const user = req.user;
  const auth = await Auth.findById(user.authId!);
  if (auth) {
    auth!.password = await bcrypt.hash(password, 10);
    await auth.save();
  }
  return res.status(200).json({ message: "Success. Password changed" });
};

const getAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {};

const AuthController = {
  register,
  activate,
  login,
  forgotPassword,
  verifyOTP,
  changePassword,
};

export default AuthController;
