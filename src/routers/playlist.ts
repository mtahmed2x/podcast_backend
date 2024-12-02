import express from "express";
import PlaylistController from "@controllers/playlist";
import { authorize, isAdmin } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", authorize, PlaylistController.create);
router.get("/:id", authorize, PlaylistController.get);
router.get("/", authorize, PlaylistController.getAll);
router.put("/update", authorize, PlaylistController.update);
router.delete("/delete", authorize, PlaylistController.remove);

export default router;
