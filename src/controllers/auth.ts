import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import httpStatus from "http-status";
import createError from "http-errors";
import bcrypt from "bcrypt";
import "dotenv/config";

import { AuthSchema } from "@schemas/auth";

import Auth from "@models/auth";
import User from "@models/user";
import Creator from "@models/creator";
import Admin from "@models/admin";

import sendEmail from "@utils/sendEmail";
import generateOTP from "@utils/generateOTP";
import { generateToken } from "@utils/jwt";

import { Role } from "@shared/enums";

const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { name, email, role, dateOfBirth, address, password, confirmPassword } = req.body;
  let error, auth, user, creator, admin;
  [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (auth) {
    const otp = generateOTP();
    auth.verificationOTP = otp;
    auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
    await auth.save();
    await sendEmail(email, otp);
    return res.status(httpStatus.OK).json({
      success: true,
      message: "Email already exists",
      data: auth.isVerified,
    });
  }

  const verificationOTP = generateOTP();
  const verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    [error, auth] = await to(
      Auth.create({
        email,
        password: hashedPassword,
        role,
        isApproved: role === Role.USER || role === Role.ADMIN,
        verificationOTP: verificationOTP,
        verificationOTPExpire,
      }),
    );
    if (error) throw error;

    [error, user] = await to(
      User.create({
        auth: auth!._id,
        name: name,
        dateOfBirth: dateOfBirth,
        address: address,
      }),
    );
    if (error) throw error;

    if (role === "CREATOR" || role === "ADMIN") {
      [error, creator] = await to(
        Creator.create({
          auth: auth._id,
          user: user._id,
        }),
      );
      if (error) throw error;
    }

    if (role === "ADMIN") {
      [error, admin] = await to(
        Admin.create({
          auth: auth._id,
          user: user._id,
          creator: creator!._id,
        }),
      );
    }

    await sendEmail(email, verificationOTP);
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: auth.isVerified,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return next(error);
  } finally {
    await session.endSession();
  }
};

type Payload = {
  email: string;
  verificationOTP: string;
};

const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<any> => {};

const verifyEmail = async (payload: Payload): Promise<[Error | null, AuthSchema | null]> => {
  const { email, verificationOTP } = payload;
  let [error, auth] = await to(Auth.findOne({ email }).select("-password"));
  if (error) return [error, null];
  if (!auth) return [createError(httpStatus.NOT_FOUND, "Account Not found"), null];
  if (auth.verificationOTP === null)
    return [createError(httpStatus.UNAUTHORIZED, "OTP Expired"), null];
  if (verificationOTP !== auth.verificationOTP)
    return [createError(httpStatus.UNAUTHORIZED, "Wrong OTP"), null];
  return [null, auth];
};

const activate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, auth] = await verifyEmail(req.body);
  if (error) return next(error);
  if (!auth) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));

  auth.verificationOTP = "";
  auth.verificationOTPExpire = null;
  auth.isVerified = true;
  await auth.save();

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (!accessSecret)
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
  const accessToken = generateToken(auth._id!.toString(), accessSecret, "96h");

  const user = await User.find({ auth: auth._id });

  const responseData: any = {
    accessToken,
    auth,
    user,
  };
  let creator;
  if (auth.role === Role.CREATOR) {
    creator = await Creator.find({ auth: auth._id });
    responseData.creator = creator;
  }

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: responseData });
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email, password } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(404, "Email don't exist"));

  const isPasswordValid = await bcrypt.compare(password, auth.password);
  if (!isPasswordValid) return next(createError(httpStatus.UNAUTHORIZED, "Wrong password"));
  if (!auth.isVerified)
    return next(createError(httpStatus.UNAUTHORIZED, "Verify your email first"));
  if (auth.isBlocked)
    return next(
      createError(httpStatus.FORBIDDEN, "Your account had been blocked. Contact Administrator"),
    );

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!accessSecret || !refreshSecret)
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));

  const accessToken = generateToken(auth._id!.toString(), accessSecret, "96h");
  const refreshToken = generateToken(auth._id!.toString(), refreshSecret, "96h");

  const user = await User.find({ auth: auth._id });

  const responseData: any = {
    accessToken,
    auth,
    user,
  };
  let creator;
  if (auth.role === Role.CREATOR) {
    creator = await Creator.find({ auth: auth._id });
    responseData.creator = creator;
  }

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: responseData });
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));

  const verificationOTP = generateOTP();
  auth.verificationOTP = verificationOTP;
  auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  await auth.save();
  await sendEmail(email, verificationOTP);

  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success. Verification mail sent." });
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, auth] = await verifyEmail(req.body);
  if (error) return next(error);
  if (!auth) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));
  const secret = process.env.JWT_RECOVERY_SECRET;
  if (!secret) {
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
  }
  const recoveryToken = generateToken(auth._id!.toString(), secret, "20m");
  if (!recoveryToken) return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "Failed"));
  res.status(200).json({ success: true, message: "Success", data: {} });
};

const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email, password, confirmPassword } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));
  if (password !== confirmPassword)
    return next(createError(httpStatus.BAD_REQUEST, "Passwords don't match"));
  auth!.password = await bcrypt.hash(password, 10);
  await auth.save();

  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success. Password changed", data: {} });
};

const getAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
  }
  const accessToken = generateToken(user.authId, secret, "96h");
  if (!accessToken) return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "Failed"));
  res.status(httpStatus.OK).json({ success: true, message: "Success", data: accessToken });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Auth.findByIdAndDelete(user.authId);
    await User.findByIdAndDelete(user.userId);
    if (user.role === Role.CREATOR) {
      await Creator.findByIdAndDelete(user.creatorId);
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      await session.endSession();
    }
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete account"));
  } finally {
    await session.commitTransaction();
    await session.endSession();
  }
  return res.status(httpStatus.OK).json({ success: true, message: "Successful" });
};

const AuthController = {
  register,
  activate,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getAccessToken,
  remove,
};

export default AuthController;
