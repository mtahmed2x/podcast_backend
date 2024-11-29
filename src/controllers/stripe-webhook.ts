import Stripe from "stripe";
import {Request, Response, NextFunction} from "express";
import createError from "http-errors";
import to from "await-to-ts";
import Subscription from "@models/subscription";
import httpStatus from "http-status";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhook = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = req.body;
  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    if (!signature) next(createError(httpStatus.FORBIDDEN, "Unauthorized"));
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature!,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(httpStatus.BAD_REQUEST).json({error: err.message});
    }
  }

  let error, subscriptionId;
  switch (event.type) {

    case "checkout.session.completed":
      let subscription;
      const session = event.data.object;
      subscriptionId = session.subscription;
      const customerId = session.customer;
      [error, subscription] = await to(Subscription.findOne({stripeCustomerId: customerId}));
      if (error) return next(error);
      if(!subscription) return next(createError(httpStatus.NOT_FOUND, "Subscription Not Found"));
      subscription.stripeSubscriptionId = subscriptionId;
      [error] = await to(subscription.save());
      if (error) return next(error);
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      subscriptionId = invoice.subscription;
      [error] = await to(Subscription.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { $set: {status: "active" }}, {new:true}));
      if (error) return next(error)
      break;
  }
}

const controller = {
  webhook,
}

export default controller;