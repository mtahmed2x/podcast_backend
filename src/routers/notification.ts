import { authorize } from "@middlewares/authorization";
import express from "express";

import NotificationServices from "src/services/notification";

const router = express.Router();

router.get("/", authorize, NotificationServices.get);

export default router;
