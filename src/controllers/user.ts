import User from "@models/user";
import Auth from "@models/auth";
import { Request, Response } from "express";
import to from "await-to-ts";
import handleError from "@utils/handleError";
import { UserSchema } from "@type/schema";

const display = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user.userId;
  const [error, user] = await to(User.findOne({ _id: userId }));
  if (error) return handleError(error, res);
  if (!user) return res.status(404).json({ error: "User Not found" });
  return res.status(200).json({ user: user });
};

type Param = {
  id: string;
};

const update = async (
  req: Request<{}, {}, UserSchema>,
  res: Response
): Promise<any> => {
  const userId = req.user.userId;
  const { name, dateOfBirth, gender, contact, address } = req.body;
  const [error, user] = await to(User.findOne({ _id: userId }));
  if (error) return handleError(error, res);
  if (!user) return res.status(404).json({ error: "User Not found" });

  const updateFields: Partial<UserSchema> = {};
  if (name) updateFields.name = name;
  if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
  if (gender) updateFields.gender = gender;
  if (contact) updateFields.contact = contact;
  if (address) updateFields.address = address;

  if (Object.keys(updateFields).length === 0)
    return res.status(400).json({ error: "Nothing to update" });

  const [updateError, updatedUser] = await to(
    User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
  );
  if (updateError) return handleError(updateError, res);
  return res.status(200).json({ message: "Update successful", updatedUser });
};

const remove = async (req: Request, res: Response): Promise<any> => {
  const user = req.user;
  const [error] = await to(Auth.findOneAndDelete({ _id: user.authId }));
  if (error) handleError(error, res);
  res.status(200).json({ message: "Account successfully deleted" });
};

const UserController = {
  display,
  update,
  remove,
};
export default UserController;
