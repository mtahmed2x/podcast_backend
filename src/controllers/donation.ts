import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import Donation from "@models/donation";
import createError from "http-errors";
import httpStatus from "http-status";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const { url } = req.body;
    const [error, donation] = await to(Donation.create({ creator: user.creatorId, url: url }));
    if (error) return next(error);
    return res
        .status(httpStatus.CREATED)
        .json({ success: true, message: "Success", data: donation });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, donation] = await to(Donation.find({ creator: id }).lean());
    if (error) return next(error);
    if (!donation) return next(createError(httpStatus.NOT_FOUND, "Donation Not Found"));
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: donation });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const [error, donations] = await to(Donation.find().lean());
    if (error) return next(error);
    if (!donations)
        return res
            .status(httpStatus.OK)
            .json({ success: true, message: "No Donations Found", data: [] });
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: donations });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const { url } = req.body;
    const [error, donation] = await to(
        Donation.findOneAndUpdate({ creator: user.creatorId }, { $set: { url } }, { new: true }),
    );
    if (error) return next(error);

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: donation });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const [error, donation] = await to(Donation.findOneAndDelete({ creator: user.creatorId }));
    if (error) return next(error);
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: donation });
};

const DonationController = {
    create,
    get,
    getAll,
    update,
    remove,
};

export default DonationController;
