import { Request, Response, NextFunction } from "express";
import Report from "@models/report";
import to from "await-to-ts";
import httpStatus from "http-status";
import createError from "http-errors";

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const [error, reports] = await to(Report.find().limit(limit).skip(skip).lean());
    if (error) {
        return next(error);
    }
    if (!reports) return next(createError(httpStatus.NOT_FOUND, "Reports not found"));
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: reports });
};

const reportController = {
    get,
};

export default reportController;
