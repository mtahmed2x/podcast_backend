import User from "@models/user";
import { NextFunction, Request, Response } from "express";
import to from "await-to-ts";
import createError from "http-errors";
import httpStatus from "http-status";
import Cloudinary from "@shared/cloudinary";

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  let error, profile;
  [error, profile] = await to(User.findOne({ _id: user.userId }).lean());
  if (error) return next(error);
  if (!profile) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));
  profile = { ...profile, email: user.email };
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: profile });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const { name, dateOfBirth, gender, contact, address, avatarUrl, backgroundImageUrl } = req.body;

  let error, user;
  [error, user] = await to(User.findOne({ _id: userId }));
  if (error) return next(error);
  if (!user) return next(createError(httpStatus.NOT_FOUND, "Account Not Found"));

  user.name = name || user.name;
  user.dateOfBirth = dateOfBirth || user.dateOfBirth;
  user.gender = gender || user.gender;
  user.contact = contact || user.contact;
  user.address = address || user.address;
  user.backgroundImage = backgroundImageUrl || user.backgroundImage;

  console.log(user);

  if (avatarUrl) {
    if (user.avatar !== null && user.avatar !== "") {
      await Cloudinary.remove(user.avatar);
    }
    user.avatar = avatarUrl;
  }

  if (backgroundImageUrl) {
    if (user.backgroundImage !== null && user.backgroundImage !== "") {
      await Cloudinary.remove(user.backgroundImage);
    }
    user.backgroundImage = backgroundImageUrl;
  }

  [error] = await to(user.save());
  if (error) return next(error);

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: user });
};

const updateLocation = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const { location } = req.body;
  const [error, user] = await to(
    User.findByIdAndUpdate(userId, { $set: { locationPreference: location } }, { new: true }),
  );
  if (error) return next(error);
  console.log(user);
  return res
    .status(httpStatus.OK)
    .json({ success: true, message: "Success", data: user?.locationPreference });
};

const UserController = {
  get,
  update,
  updateLocation,
};
export default UserController;
