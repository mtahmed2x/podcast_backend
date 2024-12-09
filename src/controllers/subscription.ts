import "dotenv/config";
import Stripe from "stripe";
import Plan from "@models/plan";
import Subscription from "@models/subscription";
import to from "await-to-ts";
import createError from "http-errors";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import httpStatus from "http-status";
import { SubscriptionStatus } from "@shared/enums";
import { addMonths, addYears } from "date-fns";
import { PlanSchema } from "@schemas/plan";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Params = {
  id: string;
};

const get = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const [error, subscription] = await to(
    Subscription.findOne({ user: user.authId })
      .populate({
        path: "plan",
        select: "name",
      })
      .lean(),
  );
  if (error) return next(error);
  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: subscription });
};

const create = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { id } = req.params;

  let error, plan, customer, session, subscription;

  [error, plan] = await to(Plan.findById(id));
  if (error) return next(error);
  if (!plan) return next(createError(httpStatus.NOT_FOUND, "Plan Not Found"));

  [error, subscription] = await to(Subscription.findOne({ user: user.authId }));
  if (error) return next(error);

  if (!subscription && plan.name === "Free") {
    [error, subscription] = await to(
      Subscription.create({
        plan: plan!._id,
        user: user.authId,
        status: SubscriptionStatus.ACTIVE,
      }),
    );
    if (error) return next(error);
    return res.status(httpStatus.CREATED).json({ success: true, message: "Success", data: subscription });
  }
  if (!subscription && plan.name !== "Free") {
    [error, customer] = await to(stripe.customers.create({ email: user.email }));
    if (error) return next(error);

    const startDate = new Date();
    let endDate: Date | null = null;
    if (plan.interval === "month") {
      endDate = addMonths(startDate, 1);
    } else if (plan.interval === "year") {
      endDate = addYears(startDate, 1);
    }

    [error, session] = await to(
      stripe.checkout.sessions.create({
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
      }),
    );
    if (error) return next(error);

    [error, subscription] = await to(
      Subscription.create({
        plan: plan._id,
        user: user.authId,
        stripeCustomerId: customer.id,
        status: SubscriptionStatus.PENDING,
        startDate: startDate,
        endDate: endDate,
      }),
    );
    if (error) return next(error);

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: { subscription, session } });
  }
  if (subscription && subscription.plan === plan._id) {
    return next(createError(httpStatus.BAD_REQUEST, "Subscription Already exists"));
  }
  if (subscription && plan.name !== "Free") {
    let customerId;
    if (subscription.stripeCustomerId === "" || !subscription.stripeCustomerId) {
      [error, customer] = await to(stripe.customers.create({ email: user.email }));
      if (error) return next(error);
      customerId = customer.id;
    } else {
      customerId = subscription.stripeCustomerId;
    }

    const startDate = new Date();
    let endDate: Date | null = null;
    if (plan.interval === "month") {
      endDate = addMonths(startDate, 1);
    } else if (plan.interval === "year") {
      endDate = addYears(startDate, 1);
    }

    [error, session] = await to(
      stripe.checkout.sessions.create({
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
      }),
    );
    if (error) return next(error);

    subscription.plan = plan!._id as Types.ObjectId;
    subscription.stripeCustomerId = customerId;
    subscription.status = SubscriptionStatus.PENDING;
    subscription.startDate = startDate;
    subscription.endDate = endDate!;

    [error] = await to(subscription.save());
    if (error) return next(error);

    return res.status(httpStatus.OK).json({ success: true, message: "Success", data: { subscription, session } });
  }
};

const upgrade = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { id } = req.params;

  let error, oldPlan, plan, subscription, session;
  let singleDayAmount = 0;
  [error, plan] = await to(Plan.findById(id));
  if (error) return next(error);
  if (!plan) return next(createError(httpStatus.NOT_FOUND, "Plan Not Found"));

  [error, subscription] = await to(Subscription.findOne({ user: user.authId }).populate({ path: "plan" }));
  if (error) return next(error);
  if (!subscription) return next(createError(httpStatus.NOT_FOUND, "Subscription Not Found"));

  if (subscription && subscription.plan) {
    oldPlan = subscription.plan as PlanSchema;
  }
  if (oldPlan!.interval === "month") {
    singleDayAmount = oldPlan!.unitAmount / 30;
  }
  if (oldPlan!.interval === "year") {
    singleDayAmount = oldPlan!.unitAmount / 365;
  }

  const difference = new Date().getTime() - subscription.startDate.getTime();
  const differenceInDays = Math.floor(difference / (1000 * 60 * 60 * 24));
  const spent = singleDayAmount * differenceInDays;
  const remaining = (subscription.plan as PlanSchema).unitAmount - spent;

  let startDate = new Date();
  let endDate: Date | null = null;
  if (plan.interval === "month") {
    endDate = addMonths(startDate, 1);
  }
  if (plan.interval === "year") {
    endDate = addYears(startDate, 1);
  }

  const newPrice = plan.unitAmount - remaining;
  [error, session] = await to(
    stripe.checkout.sessions.create({
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
    }),
  );
  if (error) return next(error);

  subscription.plan = plan._id as Types.ObjectId;
  subscription.stripeSubscriptionId = "";
  subscription.startDate = startDate;
  subscription.endDate = endDate!;
  subscription.status = SubscriptionStatus.PENDING;
  await subscription.save();

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: { subscription, session } });
};

const cancel = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  let error, plan, subscription;
  [error, plan] = await to(Plan.findOne({ name: "Free" }));
  if (error) return next(error);

  [error, subscription] = await to(Subscription.findOne({ user: user.authId }));
  if (error) return next(error);
  if (!subscription) return next(createError(httpStatus.NOT_FOUND, "Subscription not found"));

  [error] = await to(
    stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
      cancel_at_period_end: true,
    }),
  );
  if (error) return next(error);

  subscription.plan = plan!._id as Types.ObjectId;
  subscription.stripeSubscriptionId = "";
  subscription.status = SubscriptionStatus.ACTIVE;

  [error] = await to(subscription.save());
  if (error) return next(error);

  return res.status(httpStatus.OK).json({ success: true, message: "Success", data: subscription });
};

const controller = {
  get,
  create,
  cancel,
};

export default controller;
