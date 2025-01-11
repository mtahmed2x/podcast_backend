"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const category_1 = __importDefault(require("../models/category"));
const subCategory_1 = __importDefault(require("../models/subCategory"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const cloudinary_1 = __importDefault(require("../shared/cloudinary"));
const create = async (req, res, next) => {
    let error, category, subCategory;
    const { categoryId, title, subcategoryImageUrl } = req.body;
    [error, category] = await (0, await_to_ts_1.default)(category_1.default.findById(categoryId));
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Category not found!"));
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategory_1.default.create({ title: title, subCategoryImage: subcategoryImageUrl }));
    if (error)
        return next(error);
    category.subCategories.push(subCategory._id);
    console.log(category);
    [error] = await (0, await_to_ts_1.default)(category.save());
    if (error)
        return next(error);
    return res
        .status(http_status_1.default.CREATED)
        .json({ success: true, message: "Success", data: subCategory });
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const [error, subCategory] = await (0, await_to_ts_1.default)(subCategory_1.default.findById(id).populate("podcasts").lean());
    if (error)
        return next(error);
    if (!subCategory)
        return res.status(404).json({ error: "SubCategory not found!" });
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: subCategory });
};
const getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [error, subCategories] = await (0, await_to_ts_1.default)(subCategory_1.default.find().populate("podcasts").skip(skip).limit(limit).lean());
    if (error)
        return next(error);
    if (!subCategories)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "No Subcategories Found"));
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: subCategories });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const { title, subcategoryImageUrl } = req.body;
    if (!title || !subcategoryImageUrl) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Nothing to update"));
    }
    let error, subCategory;
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategory_1.default.findById(id));
    if (error)
        return next(error);
    if (!subCategory)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "SubCategory not found"));
    subCategory.title = title || subCategory.title;
    if (subcategoryImageUrl) {
        cloudinary_1.default.remove(subCategory.subCategoryImage);
        subCategory.subCategoryImage = subcategoryImageUrl;
    }
    [error] = await (0, await_to_ts_1.default)(subCategory.save());
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: subCategory });
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    let error, subCategory;
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategory_1.default.findById(id));
    if (error)
        return next(error);
    if (!subCategory)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "SubCategory not found"));
    cloudinary_1.default.remove(subCategory.subCategoryImage);
    [error, subCategory] = await (0, await_to_ts_1.default)(subCategory_1.default.findByIdAndDelete(id));
    if (error)
        return next(error);
    const category = await category_1.default.findOneAndUpdate({ subCategories: id }, { $pull: { subCategories: id } }, { new: true });
    if (!category)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Category Not Found"));
    return res.status(http_status_1.default.OK).json({ message: "Success" });
};
const getPodcasts = async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (page <= 0 || limit <= 0) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    }
    const id = req.params.id;
    let error, subCategories, podcasts;
    [error, subCategories] = await (0, await_to_ts_1.default)(subCategory_1.default.findById(id)
        .populate({
        path: "podcasts",
        select: "creator category cover title audioDuration",
        populate: [
            {
                path: "creator",
                select: "user -_id",
                populate: {
                    path: "user",
                    select: "name -_id",
                },
            },
            {
                path: "category",
                select: "title -_id",
            },
        ],
    })
        .lean());
    if (error)
        return next(error);
    if (!subCategories)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "SubCategories not found"));
    if (!subCategories.podcasts || subCategories.podcasts.length === 0) {
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: "No Podcasts Found!",
            data: {
                podcasts: [],
            },
        });
    }
    const totalPodcasts = subCategories.podcasts.length;
    const paginatedPodcasts = subCategories.podcasts.slice((page - 1) * limit, page * limit);
    const formattedPodcasts = paginatedPodcasts.map((podcast) => ({
        ...podcast,
        audioDuration: (podcast.audioDuration / 60).toFixed(2) + " min",
    }));
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: {
            podcasts: formattedPodcasts,
            currentPage: page,
            totalPages: Math.ceil(totalPodcasts / limit),
            totalPodcasts,
        },
    });
};
const SubCategoryController = {
    create,
    getAll,
    get,
    update,
    remove,
    getPodcasts,
};
exports.default = SubCategoryController;
