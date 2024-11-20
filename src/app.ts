import express, { Request, Response } from "express";
import authRouter from "@routers/auth";
import CategoryRouter from "@routers/category";
import SubCategoryRouter from "@routers/subCategory";
import PodcastRouter from "@routers/podcast";

const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use("/category", CategoryRouter);
app.use("/sub-category", SubCategoryRouter);
app.use("/podcast", PodcastRouter);

export default app;
