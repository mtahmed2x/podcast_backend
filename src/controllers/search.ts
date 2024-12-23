import Category from "@models/category";
import SubCategory from "@models/subCategory";
import Podcast from "@models/podcast";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import httpStatus from "http-status";
import to from "await-to-ts";

export const searchCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    const { query } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!query || typeof query !== "string") {
        return next(createError(httpStatus.BAD_REQUEST, "Invalid query parameter"));
    }

    const regex = new RegExp(query, "i");

    const [error, categories] = await to(
        Category.find({ title: regex }).skip(skip).limit(Number(limit)),
    );

    if (error) return next(error);

    return res.status(httpStatus.OK).json({
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

const searchSubCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    const categoryId = req.params.id;
    const query = (req.query.query as string) || "all";
    const defaultCategoryImage = "uploads/default/default-catrgoty.png";

    try {
        const category = await Category.findById(categoryId)
            .populate({
                path: "subCategories",
                select: "title subCategoryImage",
            })
            .lean();

        if (!category) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Category Not Found",
            });
        }

        let filteredSubCategories;
        if (query === "all") {
            filteredSubCategories = category.subCategories;
        } else {
            const regex = new RegExp(query, "i"); // Case-insensitive regex
            filteredSubCategories = category.subCategories.filter((subCategory: any) =>
                regex.test(subCategory.title),
            );
        }

        const formattedSubCategories = filteredSubCategories.map((subCategory: any) => ({
            _id: subCategory._id,
            title: subCategory.title,
            subCategoryImage: subCategory.subCategoryImage || defaultCategoryImage,
        }));

        return res.status(httpStatus.OK).json({
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
    } catch (error) {
        return next(error);
    }
};

export const searchPodcasts = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<any> => {
    const { query } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Validate query parameter
    if (!query || typeof query !== "string") {
        return next(createError(httpStatus.BAD_REQUEST, "Invalid query parameter"));
    }

    // Check if query is "all"
    const isShowAll = query.trim().toLowerCase() === "all";

    // Build regex for non-"all" queries
    const regex = isShowAll ? null : new RegExp(query, "i");

    const [error, podcasts] = await to(
        Podcast.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory",
                },
            },
            { $unwind: "$subCategory" },
            {
                $lookup: {
                    from: "creators",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creator",
                },
            },
            { $unwind: "$creator" },
            {
                $lookup: {
                    from: "users",
                    localField: "creator.user",
                    foreignField: "_id",
                    as: "creator.user",
                },
            },
            { $unwind: "$creator.user" },
            // Conditionally add $match stage based on query
            ...(isShowAll
                ? []
                : [
                      {
                          $match: {
                              $or: [
                                  { title: regex },
                                  { description: regex },
                                  { location: regex },
                                  { "creator.user.name": regex },
                                  { "category.title": regex },
                                  { "subCategory.title": regex },
                              ],
                          },
                      },
                  ]),
            {
                $project: {
                    title: 1,
                    description: 1,
                    location: 1,
                    audio: 1,
                    totalLikes: 1,
                    totalViews: 1,
                    audioDuration: {
                        $concat: [
                            { $toString: { $round: [{ $divide: ["$audioDuration", 60] }, 2] } },
                            " min",
                        ],
                    },
                    "creator.user.name": 1,
                    "creator.user.avatar": 1,
                    "category.title": 1,
                    "subCategory.title": 1,
                },
            },
            { $skip: skip },
            { $limit: Number(limit) },
        ]),
    );

    if (error) return next(error);

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Success",
        data: { podcasts, page: Number(page), limit: Number(limit), total: podcasts.length },
    });
};

const searchController = {
    searchCategories,
    searchSubCategories,
    searchPodcasts,
};
export default searchController;
