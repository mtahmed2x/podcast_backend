import express from "express";
import PlaylistController from "@controllers/playlist";
const router = express.Router();

router.post("/create", PlaylistController.create);
router.get("/:id", PlaylistController.get);
router.get("/", PlaylistController.getAll);
router.put("/update", PlaylistController.update);
router.delete("/delete", PlaylistController.remove);
