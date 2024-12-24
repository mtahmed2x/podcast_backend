import Support from "@models/support";
import TaC from "@models/tac";
import to from "await-to-ts";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

const add = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { text } = req.body;
    const [error, support] = await to(Support.create({ text: text }));
    if (error) return next(error);
    res.status(201).json({ message: "Success", data: support });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const [error, support] = await to(Support.findOne().limit(1));
    if (error) return next(error);
    if (!support) return next(createError(404, "Supports not found"));
    res.status(200).json({ message: "Success", data: support });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const { text } = req.body;
    const [error, support] = await to(
        Support.findByIdAndUpdate(id, { $set: { text: text } }, { new: true }),
    );
    if (error) return next(error);
    if (!support) return next(createError(404, "Support not found"));
    res.status(200).json({ message: "Success", data: support });
};

const SupportController = {
    add,
    get,
    update,
};

export default SupportController;
