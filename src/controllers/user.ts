import User from "@models/user";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import { UserSchema } from "@schemas/user";
import createError from "http-errors";
import httpStatus from "http-status";

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  let error, profile;
  [error, profile] = await to(User.findOne({ _id: user.userId }).lean());
  if (error) return next(error);
  if (!profile) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));
  profile = { ...profile, email: user.email };
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: profile });
};

type AvatarFiles = Express.Request & {
  files: { [fieldname: string]: Express.Multer.File[] };
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { userId } = req.user;
  const { name, dateOfBirth, gender, contact, address } = req.body;
  let avatar;
  if ((req as AvatarFiles).files) {
    avatar = (req as AvatarFiles).files.avatar;
  }

  let error, user;
  [error, user] = await to(User.findOne({ _id: userId }));
  if (error) return next(error);
  if (!user) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));

  const updateFields: Partial<UserSchema> = {};
  if (name) updateFields.name = name;
  if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
  if (gender) updateFields.gender = gender;
  if (contact) updateFields.contact = contact;
  if (address) updateFields.address = address;
  if (avatar) updateFields.avatar = avatar[0].path;

  if (Object.keys(updateFields).length === 0) return next(createError(httpStatus.BAD_REQUEST, "No field to update"));

  [error, user] = await to(User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }));
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: user });
};

const UserController = {
  get,
  update,
};
export default UserController;
