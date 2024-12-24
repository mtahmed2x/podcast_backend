/* Import Start */
import express from "express";
import cors from "cors";
import { errorHandler } from "@middlewares/errorHandler";
import { notFound } from "@middlewares/notfound";
import HomeRouter from "@routers/home";
import AuthRouter from "@routers/auth";
import CategoryRouter from "@routers/category";
import SubCategoryRouter from "@routers/subCategory";
import PodcastRouter from "@routers/podcast";
import PlanRouter from "@routers/plan";
import UserRouter from "@routers/user";
import CreatorRouter from "@routers/creator";
import SubscriptionRouter from "@routers/subscription";
import DashboardRouter from "@routers/dashboard";
import FaqRouter from "@routers/faq";
import TaCRouter from "@routers/tac";
import AboutRouter from "@routers/about";
import WebHookRouter from "@routers/stripe-webhook";
import HistoryRouter from "@routers/history";
import FavoriteRouter from "@routers/favorite";
import LikeRouter from "@routers/like";
import CommentRouter from "@routers/comment";
import PlaylistRouter from "@routers/playlist";
import PrivacyRouter from "@routers/privacy";
import SearchRouter from "@routers/search";
import SupportRouter from "@routers/support";
import ReportRouter from "@routers/report";
/* Import End */

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);
/* Custom Router Start */
app.use("/", WebHookRouter);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/home", HomeRouter);
app.use("/auth", AuthRouter);
app.use("/category", CategoryRouter);
app.use("/creator", CreatorRouter);
app.use("/sub-category", SubCategoryRouter);
app.use("/podcast", PodcastRouter);
app.use("/plan", PlanRouter);
app.use("/subscription", SubscriptionRouter);
app.use("/user", UserRouter);
app.use("/creator", CreatorRouter);
app.use("/dashboard", DashboardRouter);
app.use("/faq", FaqRouter);
app.use("/tac", TaCRouter);
app.use("/about", AboutRouter);
app.use("/favorite", FavoriteRouter);
app.use("/history", HistoryRouter);
app.use("/like", LikeRouter);
app.use("/comment", CommentRouter);
app.use("/playlist", PlaylistRouter);
app.use("/privacy", PrivacyRouter);
app.use("/search", SearchRouter);
app.use("/support", SupportRouter);
app.use("/report", ReportRouter);

/* Custom Router End */

/* Default Routers */
app.use(notFound);
app.use(errorHandler);

export default app;
