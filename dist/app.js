"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Import Start */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middlewares/errorHandler");
const notfound_1 = require("./middlewares/notfound");
const home_1 = __importDefault(require("./routers/home"));
const auth_1 = __importDefault(require("./routers/auth"));
const category_1 = __importDefault(require("./routers/category"));
const subCategory_1 = __importDefault(require("./routers/subCategory"));
const podcast_1 = __importDefault(require("./routers/podcast"));
const plan_1 = __importDefault(require("./routers/plan"));
const user_1 = __importDefault(require("./routers/user"));
const creator_1 = __importDefault(require("./routers/creator"));
const subscription_1 = __importDefault(require("./routers/subscription"));
const dashboard_1 = __importDefault(require("./routers/dashboard"));
const faq_1 = __importDefault(require("./routers/faq"));
const tac_1 = __importDefault(require("./routers/tac"));
const about_1 = __importDefault(require("./routers/about"));
const stripe_webhook_1 = __importDefault(require("./routers/stripe-webhook"));
const history_1 = __importDefault(require("./routers/history"));
const favorite_1 = __importDefault(require("./routers/favorite"));
const like_1 = __importDefault(require("./routers/like"));
const comment_1 = __importDefault(require("./routers/comment"));
const playlist_1 = __importDefault(require("./routers/playlist"));
const privacy_1 = __importDefault(require("./routers/privacy"));
const search_1 = __importDefault(require("./routers/search"));
const support_1 = __importDefault(require("./routers/support"));
const report_1 = __importDefault(require("./routers/report"));
const donation_1 = __importDefault(require("./routers/donation"));
const notification_1 = __importDefault(require("./routers/notification"));
const analytics_1 = __importDefault(require("./routers/analytics"));
/* Import End */
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use("/", stripe_webhook_1.default);
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("uploads"));
app.use("/home", home_1.default);
app.use("/auth", auth_1.default);
app.use("/category", category_1.default);
app.use("/creator", creator_1.default);
app.use("/sub-category", subCategory_1.default);
app.use("/podcast", podcast_1.default);
app.use("/plan", plan_1.default);
app.use("/subscription", subscription_1.default);
app.use("/user", user_1.default);
app.use("/creator", creator_1.default);
app.use("/dashboard", dashboard_1.default);
app.use("/faq", faq_1.default);
app.use("/tac", tac_1.default);
app.use("/about", about_1.default);
app.use("/favorite", favorite_1.default);
app.use("/history", history_1.default);
app.use("/like", like_1.default);
app.use("/comment", comment_1.default);
app.use("/playlist", playlist_1.default);
app.use("/privacy", privacy_1.default);
app.use("/search", search_1.default);
app.use("/support", support_1.default);
app.use("/report", report_1.default);
app.use("/donation", donation_1.default);
app.use("/notification", notification_1.default);
app.use("/analytics", analytics_1.default);
/* Custom Router End */
/* Default Routers */
app.use(notfound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.get("/", (req, res) => {
    res.send("Hello World");
});
exports.default = app;
