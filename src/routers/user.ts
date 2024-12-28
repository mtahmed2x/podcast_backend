import express from "express";
import UserController from "@controllers/user";

const router = express.Router();
import { authorize } from "@middlewares/authorization";
import { handleFileUpload } from "@middlewares/uploadFile";

router.get("/", authorize, UserController.get);
router.put("/update", handleFileUpload, authorize, UserController.update);
router.post("/update-location", authorize, UserController.updateLocation);

export default router;
