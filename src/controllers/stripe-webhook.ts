import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import to from "await-to-ts";
import Subscription from "@models/subscription";
import httpStatus from "http-status";
import { SubscriptionStatus } from "@shared/enums";
import Analytics from "@models/analytics";
import { logger } from "@shared/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhook = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = req.body;
  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    if (!signature) next(createError(httpStatus.FORBIDDEN, "Unauthorized"));
    try {
      event = stripe.webhooks.constructEvent(req.body, signature!, endpointSecret);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
    }
  }

  let error, subscriptionId, invoice;
  switch (event.type) {
    case "checkout.session.completed":
      let subscription;
      const session = event.data.object;
      subscriptionId = session.subscription;
      const customerId = session.customer;
      [error, subscription] = await to(Subscription.findOne({ stripeCustomerId: customerId }));
      if (error) return next(error);
      if (!subscription) return next(createError(httpStatus.NOT_FOUND, "Subscription Not Found"));
      subscription.stripeSubscriptionId = subscriptionId;
      [error] = await to(subscription.save());
      if (error) return next(error);
      break;

    case "invoice.payment_succeeded":
      invoice = event.data.object;
      subscriptionId = invoice.subscription;

      let analytics;

      [error] = await to(
        Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscriptionId },
          { $set: { status: SubscriptionStatus.ACTIVE } },
          { new: true },
        ),
      );
      if (error) return next(error);

      const month = new Date().toLocaleDateString("en-US", { month: "short" });
      const year = new Date().getFullYear();
      const amountPaid = Number.parseFloat(invoice.amount_paid) * 100;

      [error, analytics] = await to(Analytics.findOne({ month: month, year: year }));
      if (error) logger.error(error);

      if (!analytics) {
        [error, analytics] = await to(
          Analytics.create({ month: month, year: year, income: amountPaid, users: 1 }),
        );
        if (error) logger.error(error);
      } else {
        analytics.income += amountPaid;
        analytics.users++;
        [error] = await to(analytics.save());
        if (error) logger.error(error);
      }
      break;
    case "invoice_payment_failed":
      invoice = event.data.object;
      subscriptionId = invoice.subscription;
      [error] = await to(
        Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscriptionId },
          { $set: { status: SubscriptionStatus.PAYMENT_FAILED } },
          { new: true },
        ),
      );
      if (error) return next(error);
      break;
    case "customer.subscription.deleted":
      invoice = event.data.object;
      subscriptionId = invoice.id;

      if (invoice.cancellation_details?.canceled_at) {
        [error] = await to(
          Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { $set: { status: SubscriptionStatus.AUTO_CANCELED } },
            { new: true },
          ),
        );
        if (error) return next(error);
      } else {
        [error] = await to(
          Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { $set: { status: SubscriptionStatus.CANCELED } },
            { new: true },
          ),
        );
        if (error) return next(error);
      }
      break;
  }
};

const controller = {
  webhook,
};

export default controller;
