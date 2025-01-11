"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const http_errors_1 = __importDefault(require("http-errors"));
const await_to_ts_1 = __importDefault(require("await-to-ts"));
const subscription_1 = __importDefault(require("../models/subscription"));
const http_status_1 = __importDefault(require("http-status"));
const enums_1 = require("../shared/enums");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const webhook = async (req, res, next) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = req.body;
    if (endpointSecret) {
        const signature = req.headers["stripe-signature"];
        if (!signature)
            next((0, http_errors_1.default)(http_status_1.default.FORBIDDEN, "Unauthorized"));
        try {
            event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
        }
        catch (err) {
            console.log(`Webhook signature verification failed.`, err.message);
            return res.status(http_status_1.default.BAD_REQUEST).json({ error: err.message });
        }
    }
    let error, subscriptionId, invoice;
    switch (event.type) {
        case "checkout.session.completed":
            let subscription;
            const session = event.data.object;
            subscriptionId = session.subscription;
            const customerId = session.customer;
            [error, subscription] = await (0, await_to_ts_1.default)(subscription_1.default.findOne({ stripeCustomerId: customerId }));
            if (error)
                return next(error);
            if (!subscription)
                return next((0, http_errors_1.default)(http_status_1.default.NOT_FOUND, "Subscription Not Found"));
            subscription.stripeSubscriptionId = subscriptionId;
            [error] = await (0, await_to_ts_1.default)(subscription.save());
            if (error)
                return next(error);
            break;
        case "invoice.payment_succeeded":
            invoice = event.data.object;
            subscriptionId = invoice.subscription;
            [error] = await (0, await_to_ts_1.default)(subscription_1.default.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { $set: { status: enums_1.SubscriptionStatus.ACTIVE } }, { new: true }));
            if (error)
                return next(error);
            break;
        case "invoice_payment_failed":
            invoice = event.data.object;
            subscriptionId = invoice.subscription;
            [error] = await (0, await_to_ts_1.default)(subscription_1.default.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { $set: { status: enums_1.SubscriptionStatus.PAYMENT_FAILED } }, { new: true }));
            if (error)
                return next(error);
            break;
        case "customer.subscription.deleted":
            invoice = event.data.object;
            subscriptionId = invoice.id;
            if (invoice.cancellation_details?.canceled_at) {
                [error] = await (0, await_to_ts_1.default)(subscription_1.default.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { $set: { status: enums_1.SubscriptionStatus.AUTO_CANCELED } }, { new: true }));
                if (error)
                    return next(error);
            }
            else {
                [error] = await (0, await_to_ts_1.default)(subscription_1.default.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { $set: { status: enums_1.SubscriptionStatus.CANCELED } }, { new: true }));
                if (error)
                    return next(error);
            }
            break;
    }
};
const controller = {
    webhook,
};
exports.default = controller;
