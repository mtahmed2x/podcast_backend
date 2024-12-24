import to from "await-to-ts";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import createError from "http-errors";
import Category from "@models/category";
import Podcast from "@models/podcast";
import SubCategory from "@models/subCategory";

const create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const title = req.body.title;
    if ((req as any).files === undefined || (req as any).files.categoryImage === undefined) {
        return next(createError(httpStatus.BAD_REQUEST, "Category Image is required"));
    }
    const { categoryImage } = (req as any).files;
    const imagePath = categoryImage[0].path;
    const [error, category] = await to(Category.create({ title: title, categoryImage: imagePath }));
    if (error) return next(error);
    return res
        .status(httpStatus.CREATED)
        .json({ success: true, message: "Success", data: category });
};

const get = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, category] = await to(Category.findById(id).select("title subCategories").lean());
    if (error) return next(error);
    if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: category });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (page <= 0 || limit <= 0)
        return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));
    let error, categories;
    [error, categories] = await to(
        Category.find()
            .select("title categoryImage")
            .populate({ path: "subCategories", select: "title subCategoryImage" })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
    );
    if (error) return next(error);
    if (!categories)
        return res
            .status(httpStatus.OK)
            .json({ success: true, message: "No Categories Found", data: [] });

    const defaultCategoryImage = "uploads/default/default-catrgoty.png";
    categories = categories.map((category: any) => ({
        _id: category._id,
        title: category.title,
        image: category.categoryImage || defaultCategoryImage,
        subCategories: category.subCategories.map((subCategory: any) => ({
            _id: subCategory._id,
            title: subCategory.title,
            image: subCategory.subCategoryImage || defaultCategoryImage,
        })),
    }));
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: categories });
};

const update = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const title = req.body.title;
    const files = (req as any).files;

    let categoryImagePath;
    if (files && files.categoryImage) {
        categoryImagePath = files.categoryImage[0].path;
    }
    console.log(categoryImagePath);

    const updateData: any = {};
    if (title) updateData.title = title;
    if (categoryImagePath) updateData.categoryImage = categoryImagePath;

    const [error, category] = await to(
        Category.findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true }),
    );
    if (error) return next(error);
    if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: category });
};

const remove = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, category] = await to(Category.findOneAndDelete({ _id: id }));
    if (error) return next(error);
    if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));
    return res.status(httpStatus.OK).json({ success: true, message: "Success" });
};

const getSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);

    if (page <= 0 || limit <= 0)
        return next(createError(httpStatus.BAD_REQUEST, "Invalid pagination parameters"));

    const id = req.params.id;

    let error, category;
    [error, category] = await to(
        Category.findById(id)
            .populate({ path: "subCategories", select: "title subCategoryImage" })
            .select("titles categoryImage subCategories")
            .lean(),
    );

    if (error) return next(error);
    if (!category) return next(createError(httpStatus.NOT_FOUND, "Category Not Found"));

    if (!category.subCategories || category.subCategories.length === 0) {
        return res
            .status(httpStatus.OK)
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

    const formattedSubCategories = paginatedSubCategories.map((subCategory: any) => ({
        _id: subCategory._id,
        title: subCategory.title,
        image: subCategory.subCategoryImage || defaultCategoryImage,
    }));

    return res.status(httpStatus.OK).json({
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

const getPodcasts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = req.params.id;
    const [error, podcasts] = await to(
        Podcast.find({ category: id }).populate({
            path: "creator",
            select: "user",
            populate: { path: "user", select: "name -_id" },
        }),
    );
    if (error) return next(error);
    if (!podcasts)
        return next(createError(httpStatus.NOT_FOUND, "No podcasts found in the category"));
    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: podcasts });
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

export default CategoryController;
