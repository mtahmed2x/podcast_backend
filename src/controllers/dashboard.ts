import User from "@models/user";
import Auth from "@models/auth";
import Creator from "@models/creator";
import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import createHttpError from "http-errors";

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

const DashboardController = {
  displayAllUsers,
  displayAllCreators,
};

export default DashboardController;
