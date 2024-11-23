import User, { UserDocument } from "@models/user";
import Auth from "@models/auth";

import { Request, Response } from "express";
import to from "await-to-ts";

const display = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user.userId;
  const [error, user] = await to(User.findOne({ _id: userId }));
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "User Not found" });
  return res.status(200).json({ user: user });
};

type Param = {
  id: string;
};

const update = async (
  req: Request<{}, {}, UserDocument>,
  res: Response
): Promise<any> => {
  const userId = req.user.userId;
  const { name, dateOfBirth, gender, contact, address } = req.body;
  const [error, user] = await to(User.findOne({ _id: userId }));
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: "User Not found" });

  const updateFields: Partial<UserDocument> = {};
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
  if (updateError) return res.status(500).json({ error: updateError.message });
  return res.status(200).json({ message: "Update successful", updatedUser });
};

const block = async (req: Request<Param>, res: Response): Promise<any> => {
  const id = req.params.id;
  const user = await User.findById(id);
  const [error] = await to(
    Auth.findByIdAndUpdate(user!.auth, { $set: { isBlocked: true } })
  );
  return res.status(200).json({ message: "User successfully blocked" });
};

const UserController = {
  display,
  update,
  block,
};
export default UserController;
