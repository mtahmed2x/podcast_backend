import Stripe from "stripe";
import "dotenv/config";
import to from "await-to-ts";
import createError from "http-errors";
import { NextFunction, Request, Response } from "express";
import Plan from "@models/plan";
import { PlanSchema } from "../schemas/plan";
import httpStatus from "http-status";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Param = {
  id: string;
};

const create = async (req: Request<{}, {}, Partial<PlanSchema>>, res: Response, next: NextFunction): Promise<any> => {
  const { name, description, unitAmount, interval } = req.body;

  let error, product, price, plan;

  if (unitAmount || interval) {
    [error, product] = await to(
      stripe.products.create({
        name: name!,
        description: description,
      }),
    );
    if (error) return next(error);

    [error, price] = await to(
      stripe.prices.create({
        product: product.id,
        unit_amount: unitAmount,
        currency: "usd",
        recurring: {
          interval: interval!,
        },
      }),
    );
    if (error) return next(error);

    [error, plan] = await to(
      Plan.create({
        name: name,
        description: description,
        unitAmount: unitAmount,
        interval: interval,
        productId: product.id,
        priceId: price.id,
      }),
    );
    if (error) return next(error);
  } else {
    [error, plan] = await to(Plan.create({ name: name, description: description }));
    if (error) return next(error);
  }

  res.status(httpStatus.CREATED).json({
    message: "Success",
    data: plan,
  });
};

const get = async (req: Request<Param>, res: Response, next: NextFunction): Promise<any> => {
  const id = req.params.id;
  const [error, plan] = await to(Plan.findById(id).lean());
  if (error) return next(error);
  if (!plan) return next(createError(404, "Plan not found"));
  return res.status(200).json({ message: "Success", data: plan });
};

const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const [error, plans] = await to(Plan.find().lean());
  if (error) return next(error);
  return res.status(200).json({ message: "Success", data: plans });
};

const update = async (
  req: Request<Param, {}, Partial<PlanSchema>>,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const id = req.params.id;
  let { name, description, unitAmount, interval } = req.body;

  let error, price, plan;
  [error, plan] = await to(Plan.findById(id));
  if (error) next(error);
  if (!plan) return next(createError(404, "Plan not found"));

  let updatedProductFields: Partial<PlanSchema> = {};

  if (name || description) {
    if (name) updatedProductFields.name = name;
    if (description) updatedProductFields.description = description;

    const [error] = await to(stripe.products.update(plan.productId, updatedProductFields));
    if (error) return next(error);
  }

  let updatedPlanData: Partial<PlanSchema> = {};

  if (unitAmount || interval) {
    let [error] = await to(
      stripe.prices.update(plan.priceId, {
        active: false,
      }),
    );
    if (error) return next(error);
    if (!unitAmount) {
      unitAmount = plan.unitAmount;
    }
    if (!interval) {
      interval = plan.interval;
    }
    [error, price] = await to(
      stripe.prices.create({
        product: plan.productId,
        unit_amount: unitAmount,
        currency: "usd",
        recurring: {
          interval: interval!,
        },
      }),
    );
    if (error) return next(error);
    if (price) updatedPlanData.priceId = price.id;
  }

  if (name) updatedPlanData.name = name;
  if (description) updatedPlanData.description = description;
  if (unitAmount) updatedPlanData.unitAmount = unitAmount;
  if (interval) updatedPlanData.interval = interval;

  [error, plan] = await to(Plan.findByIdAndUpdate(id, { $set: updatedPlanData }, { new: true }));
  if (error) return next(error);

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

export default controller;
