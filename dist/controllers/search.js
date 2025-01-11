"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPodcasts = exports.searchCategories = void 0;
const category_1 = __importDefault(require("../models/category"));
const podcast_1 = __importDefault(require("../models/podcast"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const searchCategories = async (req, res, next) => {
    const { query } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    if (!query || typeof query !== "string") {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Invalid query parameter"));
    }
    const regex = new RegExp(query, "i");
    const [error, categories] = await (0, await_to_ts_1.default)(category_1.default.find({ title: regex }).skip(skip).limit(Number(limit)));
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Success",
        data: {
            categories,
            totalResults: categories.length,
            page: Number(page),
            limit: Number(limit),
        },
    });
};
exports.searchCategories = searchCategories;
const searchSubCategories = async (req, res, next) => {
    const categoryId = req.params.id;
    const query = req.query.query || "all";
    const defaultCategoryImage = "uploads/default/default-catrgoty.png";
    try {
        const category = await category_1.default.findById(categoryId)
            .populate({
            path: "subCategories",
            select: "title subCategoryImage",
        })
            .lean();
        if (!category) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                success: false,
                message: "Category Not Found",
            });
        }
        let filteredSubCategories;
        if (query === "all") {
            filteredSubCategories = category.subCategories;
        }
        else {
            const regex = new RegExp(query, "i"); // Case-insensitive regex
            filteredSubCategories = category.subCategories.filter((subCategory) => regex.test(subCategory.title));
        }
        const formattedSubCategories = filteredSubCategories.map((subCategory) => ({
            _id: subCategory._id,
            title: subCategory.title,
            subCategoryImage: subCategory.subCategoryImage || defaultCategoryImage,
        }));
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: "Success",
            data: {
                category: {
                    _id: category._id,
                    title: category.title,
                    categoryImage: category.categoryImage || defaultCategoryImage,
                },
                subCategories: formattedSubCategories,
            },
        });
    }
    catch (error) {
        return next(error);
    }
};
const searchPodcasts = async (req, res, next) => {
    const query = typeof req.query.query === "string" ? req.query.query.trim() : "all";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const isShowAll = query.toLowerCase() === "all";
    const regex = isShowAll ? null : new RegExp(query, "i");
    try {
        const aggregationPipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory",
                },
            },
            { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "creators",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "creator.user",
                    foreignField: "_id",
                    as: "creator.user",
                },
            },
            { $unwind: { path: "$creator.user", preserveNullAndEmptyArrays: true } },
            ...(isShowAll
                ? []
                : [
                    {
                        $match: {
                            $or: [{ title: regex }, { description: regex }, { location: regex }],
                        },
                    },
                ]),
            {
                $project: {
                    title: 1,
                    description: 1,
                    location: 1,
                    audio: 1,
                    cover: 1,
                    totalLikes: 1,
                    totalViews: 1,
                    audioDuration: {
                        $concat: [{ $toString: { $round: [{ $divide: ["$audioDuration", 60] }, 2] } }, " min"],
                    },
                    "creator.user.name": 1,
                    "creator.user.avatar": 1,
                    "category.title": 1,
                    "subCategory.title": 1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ];
        const podcasts = await podcast_1.default.aggregate(aggregationPipeline);
        const total = await podcast_1.default.aggregate([...aggregationPipeline, { $count: "total" }]);
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: "Success",
            data: { podcasts, page, limit, total: total[0]?.total || 0 },
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.searchPodcasts = searchPodcasts;
const searchController = {
    searchCategories: exports.searchCategories,
    searchSubCategories,
    searchPodcasts: exports.searchPodcasts,
};
exports.default = searchController;
