"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_status_1 = __importDefault(require("http-status"));
const http_errors_1 = __importDefault(require("http-errors"));
const category_1 = __importDefault(require("../models/category"));
const podcast_1 = __importDefault(require("../models/podcast"));
const cloudinary_1 = __importDefault(require("../shared/cloudinary"));
const create = async (req, res, next) => {
    const title = req.body.title;
    const categoryImageUrl = req.body.categoryImageUrl;
    const [error, category] = await (0, await_to_ts_1.default)(category_1.default.create({ title: title, categoryImage: categoryImageUrl }));
    if (error)
        return next(error);
    return res.status(http_status_1.default.CREATED).json({ success: true, message: "Success", data: category });
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const [error, category] = await (0, await_to_ts_1.default)(category_1.default.findById(id).select("title subCategories").lean());
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Category Not Found"));
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: category });
};
const getAll = async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    let filterOptions = {};
    if (req.query.id) {
        filterOptions = { _id: req.query.id };
    }
    if (page <= 0 || limit <= 0)
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    let error, categories;
    [error, categories] = await (0, await_to_ts_1.default)(category_1.default.find(filterOptions)
        .select("title categoryImage")
        .populate({ path: "subCategories", select: "title subCategoryImage" })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean());
    if (error)
        return next(error);
    if (!categories)
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No Categories Found", data: [] });
    const defaultCategoryImage = "uploads/default/default-catrgoty.png";
    categories = categories.map((category) => ({
        _id: category._id,
        title: category.title,
        image: category.categoryImage || defaultCategoryImage,
        subCategories: category.subCategories.map((subCategory) => ({
            _id: subCategory._id,
            title: subCategory.title,
            image: subCategory.subCategoryImage || defaultCategoryImage,
        })),
    }));
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: categories });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    const title = req.body.title;
    const categoryImageUrl = req.body.categoryImageUrl;
    if (!title || !categoryImageUrl) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Nothing to update"));
    }
    let error, category;
    [error, category] = await (0, await_to_ts_1.default)(category_1.default.findById(id));
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Category Not Found"));
    category.title = title || category.title;
    if (categoryImageUrl) {
        cloudinary_1.default.remove(category.categoryImage);
        category.categoryImage = categoryImageUrl;
    }
    [error] = await (0, await_to_ts_1.default)(category.save());
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: category });
};
const remove = async (req, res, next) => {
    const id = req.params.id;
    let error, category;
    [error, category] = await (0, await_to_ts_1.default)(category_1.default.findById(id));
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Category Not Found"));
    cloudinary_1.default.remove(category.categoryImage);
    [error, category] = await (0, await_to_ts_1.default)(category_1.default.findOneAndDelete({ _id: id }));
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: {} });
};
const getSubCategories = async (req, res, next) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    if (page <= 0 || limit <= 0)
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters"));
    const id = req.params.id;
    let error, category;
    [error, category] = await (0, await_to_ts_1.default)(category_1.default.findById(id)
        .populate({ path: "subCategories", select: "title subCategoryImage" })
        .select("titles categoryImage subCategories")
        .lean());
    if (error)
        return next(error);
    if (!category)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Category Not Found"));
    if (!category.subCategories || category.subCategories.length === 0) {
        return res
            .status(http_status_1.default.OK)
            .json({ success: true, message: "No SubCategories Found", data: [] });
    }
    const totalSubCategories = category.subCategories.length;
    const paginatedSubCategories = category.subCategories.slice((page - 1) * limit, page * limit);
    const defaultCategoryImage = "uploads/default/default-category.png";
    const formattedCategories = {
        _id: category._id,
        title: category.title,
        image: category.categoryImage || defaultCategoryImage,
    };
    const formattedSubCategories = paginatedSubCategories.map((subCategory) => ({
        _id: subCategory._id,
        title: subCategory.title,
        image: subCategory.subCategoryImage || defaultCategoryImage,
    }));
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: {
            category: formattedCategories,
            subCategories: formattedSubCategories,
            currentPage: page,
            totalPages: Math.ceil(totalSubCategories / limit),
            totalSubCategories,
        },
    });
};
const getPodcasts = async (req, res, next) => {
    const id = req.params.id;
    const [error, podcasts] = await (0, await_to_ts_1.default)(podcast_1.default.find({ category: id }).populate({
        path: "creator",
        select: "user",
        populate: { path: "user", select: "name -_id" },
    }));
    if (error)
        return next(error);
    if (!podcasts)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "No podcasts found in the category"));
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: podcasts });
};
const CategoryController = {
    create,
    get,
    getAll,
    update,
    remove,
    getSubCategories,
    getPodcasts,
};
exports.default = CategoryController;
