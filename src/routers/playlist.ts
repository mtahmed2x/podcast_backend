import express from "express";
import PlaylistController from "@controllers/playlist";
import { authorize } from "@middlewares/authorization";

const router = express.Router();

router.post("/create", authorize, PlaylistController.create);
router.get("/:id", authorize, PlaylistController.get);
router.get("/", authorize, PlaylistController.getAll);
router.put("/update/:id", authorize, PlaylistController.update);
router.delete("/delete/:id", authorize, PlaylistController.remove);
router.get("/:id/podcasts", authorize, PlaylistController.getPodcast);
router.post("/:id/add-podcasts", authorize, PlaylistController.addPodcast);
router.post("/:id/remove-podcasts", authorize, PlaylistController.removePodcast);

export default router;
