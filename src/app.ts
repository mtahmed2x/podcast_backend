import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRouter from "@routers/auth";
import CategoryRouter from "@routers/category";
import SubCategoryRouter from "@routers/subCategory";
import PodcastRouter from "@routers/podcast";
import PlanRouter from "@routers/plan";
import UserRouter from "@routers/user";
import CreatorRouter from "@routers/creator";
import SubScriptionRouter from "@routers/subscription";
import DashboardRouter from "@routers/dashboard";
import { errorHandler } from "@utils/errorHandler";
import FaqRouter from "@routers/faq";
import TermRouter from "@routers/term";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/auth", authRouter);
app.use("/category", CategoryRouter);
app.use("/sub-category", SubCategoryRouter);
app.use("/podcast", PodcastRouter);
app.use("/plan", PlanRouter);
app.use("subscription", SubScriptionRouter);
app.use("/user", UserRouter);
app.use("/creator", CreatorRouter);
app.use("/dashboard", DashboardRouter);
app.use("/faq", FaqRouter);
app.use("/term", TermRouter);

app.use(errorHandler);

export default app;
