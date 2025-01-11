"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const stripe_1 = __importDefault(require("stripe"));
const plan_1 = __importDefault(require("../models/plan"));
const subscription_1 = __importDefault(require("../models/subscription"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const http_errors_1 = __importDefault(require("http-errors"));
const http_status_1 = __importDefault(require("http-status"));
const enums_1 = require("../shared/enums");
const date_fns_1 = require("date-fns");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const get = async (req, res, next) => {
    const user = req.user;
    const [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.findOne({ user: user.authId })
        .populate({
        path: "plan",
        select: "name",
    })
        .lean());
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: subscription });
};
const create = async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    let error, plan, customer, session, subscription;
    [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.findById(id));
    if (error)
        return next(error);
    if (!plan)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Plan Not Found"));
    [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.findOne({ user: user.authId }));
    if (error)
        return next(error);
    if (!subscription && plan.name === "Free") {
        [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.create({
            plan: plan._id,
            user: user.authId,
            status: enums_1.SubscriptionStatus.ACTIVE,
        }));
        if (error)
            return next(error);
        return res.status(http_status_1.default.CREATED).json({ success: true, message: "Success", data: subscription });
    }
    if (!subscription && plan.name !== "Free") {
        [error, customer] = await (0, await_to_ts_1.default)(stripe.customers.create({ email: user.email }));
        if (error)
            return next(error);
        const startDate = new Date();
        let endDate = null;
        if (plan.interval === "month") {
            endDate = (0, date_fns_1.addMonths)(startDate, 1);
        }
        else if (plan.interval === "year") {
            endDate = (0, date_fns_1.addYears)(startDate, 1);
        }
        [error, session] = await (0, await_to_ts_1.default)(stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            customer: customer.id,
            mode: "subscription",
            line_items: [
                {
                    price: plan.priceId,
                    quantity: 1,
                },
            ],
            success_url: `https://example.com/success`,
            cancel_url: `https://example.com/cancel`,
        }));
        if (error)
            return next(error);
        [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.create({
            plan: plan._id,
            user: user.authId,
            stripeCustomerId: customer.id,
            status: enums_1.SubscriptionStatus.PENDING,
            startDate: startDate,
            endDate: endDate,
        }));
        if (error)
            return next(error);
        return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: { subscription, session } });
    }
    if (subscription && subscription.plan === plan._id) {
        return next((0, http_errors_1.default)(http_status_1.default.BAD_REQUEST, "Subscription Already exists"));
    }
    if (subscription && plan.name !== "Free") {
        let customerId;
        if (subscription.stripeCustomerId === "" || !subscription.stripeCustomerId) {
            [error, customer] = await (0, await_to_ts_1.default)(stripe.customers.create({ email: user.email }));
            if (error)
                return next(error);
            customerId = customer.id;
        }
        else {
            customerId = subscription.stripeCustomerId;
        }
        const startDate = new Date();
        let endDate = null;
        if (plan.interval === "month") {
            endDate = (0, date_fns_1.addMonths)(startDate, 1);
        }
        else if (plan.interval === "year") {
            endDate = (0, date_fns_1.addYears)(startDate, 1);
        }
        [error, session] = await (0, await_to_ts_1.default)(stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            customer: customerId,
            mode: "subscription",
            line_items: [
                {
                    price: plan.priceId,
                    quantity: 1,
                },
            ],
            success_url: `https://example.com/success`,
            cancel_url: `https://example.com/cancel`,
        }));
        if (error)
            return next(error);
        subscription.plan = plan._id;
        subscription.stripeCustomerId = customerId;
        subscription.status = enums_1.SubscriptionStatus.PENDING;
        subscription.startDate = startDate;
        subscription.endDate = endDate;
        [error] = await (0, await_to_ts_1.default)(subscription.save());
        if (error)
            return next(error);
        return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: { subscription, session } });
    }
};
const upgrade = async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    let error, oldPlan, plan, subscription, session;
    let singleDayAmount = 0;
    [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.findById(id));
    if (error)
        return next(error);
    if (!plan)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Plan Not Found"));
    [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.findOne({ user: user.authId }).populate({ path: "plan" }));
    if (error)
        return next(error);
    if (!subscription)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Subscription Not Found"));
    if (subscription && subscription.plan) {
        oldPlan = subscription.plan;
    }
    if (oldPlan.interval === "month") {
        singleDayAmount = oldPlan.unitAmount / 30;
    }
    if (oldPlan.interval === "year") {
        singleDayAmount = oldPlan.unitAmount / 365;
    }
    const difference = new Date().getTime() - subscription.startDate.getTime();
    const differenceInDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    const spent = singleDayAmount * differenceInDays;
    const remaining = subscription.plan.unitAmount - spent;
    let startDate = new Date();
    let endDate = null;
    if (plan.interval === "month") {
        endDate = (0, date_fns_1.addMonths)(startDate, 1);
    }
    if (plan.interval === "year") {
        endDate = (0, date_fns_1.addYears)(startDate, 1);
    }
    const newPrice = plan.unitAmount - remaining;
    [error, session] = await (0, await_to_ts_1.default)(stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: subscription.stripeCustomerId,
        mode: "subscription",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: newPrice,
                },
                quantity: 1,
            },
        ],
        success_url: `https://example.com/success`,
        cancel_url: `https://example.com/cancel`,
    }));
    if (error)
        return next(error);
    subscription.plan = plan._id;
    subscription.stripeSubscriptionId = "";
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.status = enums_1.SubscriptionStatus.PENDING;
    await subscription.save();
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: { subscription, session } });
};
const cancel = async (req, res, next) => {
    const user = req.user;
    let error, plan, subscription;
    [error, plan] = await (0, await_to_ts_1.default)(plan_1.default.findOne({ name: "Free" }));
    if (error)
        return next(error);
    [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.findOne({ user: user.authId }));
    if (error)
        return next(error);
    if (!subscription)
        return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Subscription not found"));
    [error] = await (0, await_to_ts_1.default)(stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
    }));
    if (error)
        return next(error);
    subscription.plan = plan._id;
    subscription.stripeSubscriptionId = "";
    subscription.status = enums_1.SubscriptionStatus.ACTIVE;
    [error] = await (0, await_to_ts_1.default)(subscription.save());
    if (error)
        return next(error);
    return res.status(http_status_1.default.OK).json({ success: true, message: "Success", data: subscription });
};
const controller = {
    get,
    create,
    cancel,
};
exports.default = controller;
