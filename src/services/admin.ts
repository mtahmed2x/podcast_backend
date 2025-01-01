import Auth from "@models/auth";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";

const approve = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const id = req.params.id;
  const [error, auth] = await to(
    Auth.findByIdAndUpdate(id, { $set: { isApproved: true } }, { new: true }),
  );
  if (error) next(error);
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: { isApproved: auth?.isApproved },
  });
};

const block = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const id = req.params.id;
  const [error, auth] = await to(
    Auth.findByIdAndUpdate(id, { $set: { isBlocked: true } }, { new: true }),
  );
  if (error) next(error);
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: { isBlocked: auth?.isBlocked },
  });
};

const unblock = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const id = req.params.id;
  const [error, auth] = await to(
    Auth.findByIdAndUpdate(id, { $set: { isBlocked: false } }, { new: true }),
  );
  if (error) next(error);
  return res.status(httpStatus.OK).json({
    success: true,
    message: "Success",
    data: { isBlocked: auth?.isBlocked },
  });
};

const AdminServices = {
  approve,
  block,
  unblock,
};

export default AdminServices;
