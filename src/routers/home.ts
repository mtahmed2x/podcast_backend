import express from "express";

const router = express.Router();
import homeController from "@controllers/home";
import { authorize } from "@middlewares/authorization";

router.get("/", authorize, homeController);
export default router;
