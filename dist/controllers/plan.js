"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
require("dotenv/config");
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const plan_1 = __importDefault(require("../models/plan"));
const http_status_1 = __importDefault(require("http-status"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const create = async (req, res, next) => {
    const { name, description, unitAmount, interval } = req.body;
    let error, product, price, plan;
    if (unitAmount || interval) {
        [error, product] = await (0, await_to_ts_1.default)(stripe.products.create({
            name: name,
            description: description,
        }));
        if (error)
            return next(error);
        [error, price] = await (0, await_to_ts_1.default)(stripe.prices.create({
            product: product.id,
            unit_amount: unitAmount,
            currency: "usd",
            recurring: {
                interval: interval,
            },
        }));
        if (error)
            return next(error);
        [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.create({
            name: name,
            description: description,
            unitAmount: unitAmount,
            interval: interval,
            productId: product.id,
            priceId: price.id,
        }));
        if (error)
            return next(error);
    }
    else {
        [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.create({ name: name, description: description }));
        if (error)
            return next(error);
    }
    res.status(http_status_1.default.CREATED).json({
        message: "Success",
        data: plan,
    });
};
const get = async (req, res, next) => {
    const id = req.params.id;
    const [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.findById(id).lean());
    if (error)
        return next(error);
    if (!plan)
        return next((0, http_errors_1.default)(404, "Plan not found"));
    return res.status(200).json({ message: "Success", data: plan });
};
const getAll = async (req, res, next) => {
    const [error, plans] = await (0, await_to_ts_1.default)(plan_1.default.find().lean());
    if (error)
        return next(error);
    if (!plans || plans.length === 0) {
        return res.status(200).json({ success: true, message: "No Plans Found", data: [] });
    }
    return res.status(200).json({ success: true, message: "Success", data: plans });
};
const update = async (req, res, next) => {
    const id = req.params.id;
    let { name, description, unitAmount, interval } = req.body;
    let error, price, plan;
    [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.findById(id));
    if (error)
        next(error);
    if (!plan)
        return next((0, http_errors_1.default)(404, "Plan not found"));
    let updatedProductFields = {};
    if (name || description) {
        if (name)
            updatedProductFields.name = name;
        if (description)
            updatedProductFields.description = description;
        const [error] = await (0, await_to_ts_1.default)(stripe.products.update(plan.productId, updatedProductFields));
        if (error)
            return next(error);
    }
    let updatedPlanData = {};
    if (unitAmount || interval) {
        let [error] = await (0, await_to_ts_1.default)(stripe.prices.update(plan.priceId, {
            active: false,
        }));
        if (error)
            return next(error);
        if (!unitAmount) {
            unitAmount = plan.unitAmount;
        }
        if (!interval) {
            interval = plan.interval;
        }
        [error, price] = await (0, await_to_ts_1.default)(stripe.prices.create({
            product: plan.productId,
            unit_amount: unitAmount,
            currency: "usd",
            recurring: {
                interval: interval,
            },
        }));
        if (error)
            return next(error);
        if (price)
            updatedPlanData.priceId = price.id;
    }
    if (name)
        updatedPlanData.name = name;
    if (description)
        updatedPlanData.description = description;
    if (unitAmount)
        updatedPlanData.unitAmount = unitAmount;
    if (interval)
        updatedPlanData.interval = interval;
    [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.findByIdAndUpdate(id, { $set: updatedPlanData }, { new: true }));
    if (error)
        return next(error);
    res.status(200).json({
        message: "Success",
        data: plan,
    });
};
const controller = {
    create,
    get,
    getAll,
    update,
};
exports.default = controller;
