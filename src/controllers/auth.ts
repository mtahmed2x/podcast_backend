import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import httpStatus from "http-status";
import createError from "http-errors";
import bcrypt from "bcrypt";
import "dotenv/config";
import { AuthSchema } from "@schemas/auth";
import { UserSchema } from "@schemas/user";
import { AdminSchema } from "@schemas/admin";
import { CreatorSchema } from "@schemas/creator";
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
  if (auth) return next(createError(httpStatus.BAD_REQUEST, "Email already exists"));

  const verificationOTP = generateOTP();
  const verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  const session = await mongoose.startSession();
  session.startTransaction();

  type ResponseData = [AuthSchema, UserSchema, CreatorSchema?, AdminSchema?];
  let responseData: ResponseData;

  try {
    auth = await Auth.create({
      email,
      password: hashedPassword,
      role,
      verificationOTP: verificationOTP,
      verificationOTPExpire,
    });

    user = await User.create({
      auth: auth!._id,
      name: name,
      dateOfBirth: dateOfBirth,
      address: address,
    });

    responseData = [auth as AuthSchema, user as UserSchema];

    if (role === "CREATOR") {
      creator = await Creator.create({
        auth: auth._id,
        user: user._id,
      });
      responseData.push(creator);
    }

    if (role === "ADMIN") {
      admin = await Admin.create({
        auth: auth._id,
        user: user._id,
      });
      responseData.push(admin);
      await sendEmail(email, verificationOTP);
    }

    await session.commitTransaction();
    await session.endSession();

    return res.status(201).json({
      message: "User registered successfully!",
      data: responseData,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
      await session.endSession();
    }
    return next(error);
  }
};

type Payload = {
  email: string;
  verificationOTP: string;
};

const verifyEmail = async (payload: Payload): Promise<AuthSchema> => {
  const { email, verificationOTP } = payload;
  let [error, auth] = await to(Auth.findOne({ email }));
  if (error) throw error;
  if (!auth) throw createError(httpStatus.NOT_FOUND, "User Not found");
  if (verificationOTP !== auth.verificationOTP) throw createError(httpStatus.UNAUTHORIZED, "Wrong Verification OTP");
  if (new Date() > auth.verificationOTPExpire!) {
    throw createError(httpStatus.GONE, "Verification OTP has expired");
  } else return auth;
};

const activate = async (req: Request, res: Response): Promise<any> => {
  let auth = await verifyEmail(req.body);
  if (auth) {
    auth.verificationOTP = "";
    auth.verificationOTPExpire = null;
    auth.isVerified = true;
    await auth.save();
    return res.status(httpStatus.OK).json({ message: "Success" });
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email, password } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(404, "Email don't exist"));

  const isPasswordValid = await bcrypt.compare(password, auth.password);
  if (!isPasswordValid) return next(createError(httpStatus.UNAUTHORIZED, "Wrong password"));
  if (!auth.isVerified) return next(createError(httpStatus.UNAUTHORIZED, "Verify your email first"));
  if (auth.isBlocked)
    return next(createError(httpStatus.FORBIDDEN, "Your account had been blocked. Contact Administrator"));

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!accessSecret || !refreshSecret)
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));

  const accessToken = generateToken(auth._id!.toString(), accessSecret, "96h");
  const refreshToken = generateToken(auth._id!.toString(), refreshSecret, "96h");

  return res.status(httpStatus.OK).json({ message: "Success", data: { accessToken, refreshToken } });
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { email } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return next(createError(httpStatus.NOT_FOUND, "User Not Found"));

  const verificationOTP = generateOTP();
  auth.verificationOTP = verificationOTP;
  auth.verificationOTPExpire = new Date(Date.now() + 1 * 60 * 1000);
  await auth.save();
  await sendEmail(email, verificationOTP);

  return res.status(httpStatus.OK).json({ message: "Success. Verification mail sent." });
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const auth = await verifyEmail(req.body);
  if (auth) {
    const secret = process.env.JWT_RECOVERY_SECRET;
    if (!secret) {
      return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
    }
    const recoveryToken = generateToken(auth._id!.toString(), secret, "20m");
    if (!recoveryToken) return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "Failed"));
    res.status(200).json({ message: "Success", data: recoveryToken });
  }
};

const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) return next(createError(httpStatus.BAD_REQUEST, "Passwords don't match"));
  const user = req.user;
  const auth = await Auth.findById(user.authId!);
  if (auth) {
    auth!.password = await bcrypt.hash(password, 10);
    await auth.save();
  }
  return res.status(httpStatus.OK).json({ message: "Success. Password changed" });
};

const getAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "JWT secret is not defined."));
  }
  const accessToken = generateToken(user.authId, secret, "96h");
  if (!accessToken) return next(createError(httpStatus.INTERNAL_SERVER_ERROR, "Failed"));
  res.status(httpStatus.OK).json({ message: "Success", data: accessToken });
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
  return res.status(httpStatus.OK).json({ message: "Successful" });
};

const AuthController = {
  register,
  activate,
  login,
  forgotPassword,
  verifyOTP,
  changePassword,
  getAccessToken,
  remove,
};

export default AuthController;
