import express, { Request, Response } from "express";
import authRouter from "@routers/auth";
import CategoryRouter from "@routers/category";
import SubCategoryRoutes from "@routers/subCategory";

const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.use("/category", CategoryRouter);
app.use("/sub-category", SubCategoryRoutes);

export default app;
