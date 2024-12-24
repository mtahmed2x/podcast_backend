import User from "@models/user";
import Auth from "@models/auth";
import Creator from "@models/creator";
import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import createError from "http-errors";
import Admin from "@models/admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { UserSchema } from "@schemas/user";
import { Role } from "@shared/enums";

const displayAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const [error, users] = await to(
        User.find()
            .populate({
                path: "auth",
                match: { role: Role.USER },
                select: "email role subscriptionType isBlocked",
            })
            .exec()
            .then((users) => users.filter((user) => user.auth)),
    );
    if (error) return next(error);
    return res.status(200).json({ message: "Successful", data: users });
};

const searchUsersByName = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Please provide a name to search.",
            data: {},
        });
    }

    const searchQuery = {
        name: { $regex: name, $options: "i" },
    };

    const [error, users] = await to(
        User.find(searchQuery)
            .populate({
                path: "auth",
                match: { role: Role.USER },
                select: "email role subscriptionType isBlocked",
            })
            .exec()
            .then((users) => users.filter((user) => user.auth)),
    );

    if (error) return next(error);

    return res.status(200).json({ success: true, message: "Successful", data: users });
};

const displayAllCreators = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    const [error, creators] = await to(
        Creator.find().populate({
            path: "user",
            populate: { path: "auth", select: "email subscriptionType isBlocked" },
        }),
    );
    if (error) return next(error);
    return res.status(200).json({ message: "Successful", data: creators });
};

const searchCreatorsByName = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({
            message: "Please provide a name to search.",
        });
    }

    const searchQuery = { $regex: name, $options: "i" }; // Case-insensitive partial match

    const [error, creators] = await to(
        Creator.aggregate([
            {
                $lookup: {
                    from: "users", // Collection to join (users)
                    localField: "user", // Field in Creator collection
                    foreignField: "_id", // Field in User collection
                    as: "user", // Output array field
                },
            },
            {
                $unwind: "$user", // Deconstruct the user array
            },
            {
                $lookup: {
                    from: "auths", // Collection to join (auths)
                    localField: "user.auth",
                    foreignField: "_id",
                    as: "user.auth", // Output array field
                },
            },
            {
                $unwind: "$user.auth", // Deconstruct the auth array
            },
            {
                $match: {
                    "user.name": searchQuery, // Match user name with regex
                },
            },
            {
                $project: {
                    _id: 1,
                    "user.name": 1,
                    "user.contact": 1,
                    "user.address": 1,
                    "user.dateOfBirth": 1,
                    "user.gender": 1,
                    "user.avatar": 1,
                    "user.auth.email": 1,
                    "user.auth.subscriptionType": 1,
                    "user.auth.isBlocked": 1,
                },
            },
        ]),
    );

    if (error) return next(error);

    if (!creators || creators.length === 0) {
        return res.status(404).json({
            message: "No creators found with the given name.",
            data: [],
        });
    }

    return res.status(200).json({ message: "Successful", data: creators });
};

const adminProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const [error, admin] = await to(
        Admin.findOne({ auth: user.authId, user: user.userId })
            .populate({ path: "auth", select: "email role -_id" })
            .populate({ path: "user", select: "name contact address -_id" }),
    );
    if (error) return next(error);
    if (!admin) return next(createError(404, "No Admin Found"));
    return res.status(200).json({ message: "Success", data: admin });
};

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "96h" });
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;
    const [error, auth] = await to(Auth.findOne({ email }));
    if (error) return next(error);
    if (!auth) return res.status(404).json({ error: "Email don't exist" });

    const isPasswordValid = await bcrypt.compare(password, auth.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Wrong password" });
    if (auth.role !== "ADMIN") {
        return next(createError(403, "Access Denied. Only Admin Allowed"));
    }
    const token = generateToken(auth._id!.toString());
    return res.status(200).json({ message: "Login Successful", token: token });
};

const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const { name, contact, address } = req.body;

    const updateFields: Partial<UserSchema> = {};
    if (name) updateFields.name = name;
    if (contact) updateFields.contact = contact;
    if (address) updateFields.address = address;

    if (Object.keys(updateFields).length === 0)
        return res.status(400).json({ error: "Nothing to update" });

    const [error, updatedUser] = await to(
        User.findByIdAndUpdate(user.userId, { $set: updateFields }, { new: true }),
    );
    if (error) return next(error);
    return res.status(200).json({ message: "Update successful", data: updatedUser });
};

const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user;
    const { password, newPassword, confirmPassword } = req.body;
    let [error, auth] = await to(Auth.findById(user.authId));
    if (error) return next(error);
    const isPasswordValid = await bcrypt.compare(password, auth!.password);
    if (!isPasswordValid) return next(createError(401, "Incorrect Password"));
    if (newPassword !== confirmPassword) return next(createError(400, "Password's don't match"));
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    [error, auth] = await to(
        Auth.findByIdAndUpdate(user.authId, { $set: { password: hashedPassword } }, { new: true }),
    );
    if (error) return next(error);
    res.status(200).json({ success: true, message: "Success", data: {} });
};

type Param = {
    id: string;
};

const block = async (req: Request<Param>, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error] = await to(Auth.findByIdAndUpdate(id, { $set: { isBlocked: true } }));
    if (error) next(error);
    return res.status(200).json({ message: "Success" });
};

const unblock = async (req: Request<Param>, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error] = await to(Auth.findByIdAndUpdate(id, { $set: { isBlocked: false } }));
    if (error) next(error);
    return res.status(200).json({ message: "Success" });
};

const totalSubscriber = async (
    req: Request<Param>,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    return res.status(200).json({ message: "Success", data: 20 });
};

const incomeByMonth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const income = {
        Jan: 3200,
        Feb: 2800,
        Mar: 3500,
        Apr: 3000,
        May: 4000,
        Jun: 3200,
        Jul: 3100,
        Aug: 3300,
        Sep: 3400,
        Oct: 3700,
        Nov: 3600,
        Dec: 3800,
    };
    return res.status(200).json({ message: "Success", data: income });
};

const subscribersByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    const subscribers = {
        Jan: 1200,
        Feb: 1150,
        Mar: 1300,
        Apr: 1400,
        May: 1600,
        Jun: 1550,
        Jul: 1700,
        Aug: 1800,
        Sep: 1900,
        Oct: 2000,
        Nov: 2100,
        Dec: 2200,
    };

    return res.status(200).json({ message: "Success", data: subscribers });
};

const DashboardController = {
    displayAllUsers,
    displayAllCreators,
    adminProfile,
    login,
    updateProfile,
    changePassword,
    block,
    unblock,
    totalSubscriber,
    incomeByMonth,
    subscribersByMonth,
    searchUsersByName,
    searchCreatorsByName,
};

export default DashboardController;
