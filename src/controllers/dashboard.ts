import User, { UserDocument } from "@models/user";
import Auth from "@models/auth";
import Creator from "@models/creator";
import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import createError from "http-errors";
import Admin from "@models/admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { error } from "console";

const displayAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const [error, users] = await to(
    User.find()
      .populate({
        path: "auth",
        match: { role: "user" },
        select: "email subscriptionType",
      })
      .exec()
      .then((users) => users.filter((user) => user.auth))
  );
  if (error) return next(error);
  return res.status(200).json({ message: "Successful", users });
};

const displayAllCreators = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const [error, creators] = await to(
    Creator.find().populate({
      path: "user",
      populate: { path: "auth", select: "email subscriptionType" },
    })
  );
  if (error) return next(error);
  return res.status(200).json({ message: "Successful", creators });
};

const adminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;
  const [error, admin] = await to(
    Admin.findOne({ auth: user.authId, user: user.userId })
      .populate({ path: "auth", select: "email role -_id" })
      .populate({ path: "user", select: "name contact address -_id" })
  );
  if (error) return next(error);
  if (!admin) return next(createError(404, "No Admin Found"));
  return res.status(200).json({ message: "Success", data: admin });
};

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "96h" });
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { email, password } = req.body;
  const [error, auth] = await to(Auth.findOne({ email }));
  if (error) return next(error);
  if (!auth) return res.status(404).json({ error: "Email don't exist" });

  const isPasswordValid = await bcrypt.compare(password, auth.password);
  if (!isPasswordValid)
    return res.status(401).json({ error: "Wrong password" });
  if (auth.role !== "ADMIN") {
    return next(createError(403, "Access Denied. Only Admin Allowed"));
  }
  const token = generateToken(auth._id!.toString());
  return res.status(200).json({ message: "Login Successful", token: token });
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;
  const { name, contact, address } = req.body;

  const updateFields: Partial<UserDocument> = {};
  if (name) updateFields.name = name;
  if (contact) updateFields.contact = contact;
  if (address) updateFields.address = address;

  if (Object.keys(updateFields).length === 0)
    return res.status(400).json({ error: "Nothing to update" });

  const [error, updatedUser] = await to(
    User.findByIdAndUpdate(user.userId, { $set: updateFields }, { new: true })
  );
  if (error) return next(error);
  return res
    .status(200)
    .json({ message: "Update successful", data: updatedUser });
};

// const changePassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   const user = req.user;
//   const { password, newPassword, confirmPassword } = req.body;
//   const auth = Auth.findById(user.authId);
//   if (auth) {
//     const isPasswordValid = await bcrypt.compare(password, auth.password);
//   }
// };

const DashboardController = {
  displayAllUsers,
  displayAllCreators,
  adminProfile,
  login,
  updateProfile,
};

export default DashboardController;
