import "dotenv/config";
import Stripe from "stripe";
import Plan from "@models/plan";
import Subscription from "@models/subscription";
import to from "await-to-ts";
import createError from "http-errors";
import {NextFunction, Request, Response} from "express";
import {Types} from "mongoose";
import httpStatus from "http-status";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Params = {
  id: string;
};

const create = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  let error, plan, subscription;
  [error, plan] = await to(Plan.findOne({name: "Free"}));
  if(error) return next(error);

  [error, subscription] = await to(
    Subscription.create({ user: user.authId, plan: plan!._id, status: "active" })
  );
  if (error) next(error);
  return res.status(httpStatus.CREATED).json({message: "Success", data: subscription});
}

const get = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const [error, subscription] = await to(Subscription.findOne({user: user.authId}));
  console.log(subscription);
  if (error) next(error);
  return res.status(httpStatus.OK).json({message: "Success", data: subscription});
}

const upgrade = async (req: Request<Params>, res: Response, next: NextFunction): Promise<any> => {
  const user = req.user;
  const { id } = req.params;

  let error, plan, customer, session, subscription, customerId;

  [error, plan] = await to(Plan.findById(id));
  if(error) return next(error);
  if (!plan) return next(createError(httpStatus.NOT_FOUND, "Plan Not Found"));

  [error, subscription] = await to(Subscription.findOne({user: user.authId}));
  if (error) next(error);
  if(!subscription) return next(createError(httpStatus.NOT_FOUND, "Subscription not found"));

  if(subscription.stripeCustomerId === "" || !subscription.stripeCustomerId) {
    [error, customer] = await to(stripe.customers.create({email: user.email}));
    customerId = customer.id;
    if(error) return next(error);
  } else {
    customerId = subscription.stripeCustomerId;
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
    })
  );
  if (error) return next(error);

  subscription.plan = plan!._id as Types.ObjectId;
  subscription.stripeCustomerId = customerId;
  subscription.status = "pending";

  [error] = await to(subscription.save());
  if(error) return next(error);

  return res.status(httpStatus.OK).json({ message: "Success", data: [subscription, session]});
};

const cancel = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
  const user = req.user;
  let error, plan, subscription;
  [error, plan] = await to(Plan.findOne({name: "Free"}));
  if(error) return next(error);

  [error, subscription] = await to(Subscription.findOne({user: user.authId}));
  if(error) return next(error);
  if(!subscription) return next(createError(httpStatus.NOT_FOUND, "Subscription not found"));

  [error] = await to(stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
    cancel_at_period_end: true,
  }));
  if(error) return next(error);

  subscription.plan = plan!._id as Types.ObjectId;
  subscription.stripeSubscriptionId = "";
  subscription.status = "active";

  [error] = await to(subscription.save());
  if(error) return next(error);

  return res.status(httpStatus.OK).json({ message: "Success", data: subscription});
}

const controller = {
  create,
  get,
  upgrade,
  cancel
};

export default controller;
