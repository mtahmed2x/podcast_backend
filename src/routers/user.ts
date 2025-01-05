import express from "express";
import UserController from "@controllers/user";

const router = express.Router();
import { authorize } from "@middlewares/authorization";
import fileUpload from "express-fileupload";
import fileHandler from "@middlewares/fileHandler";

router.get("/", authorize, UserController.get);
router.put("/update", fileUpload(), fileHandler, authorize, UserController.update);
router.post("/update-location", authorize, UserController.updateLocation);

export default router;
