import express from "express";
import PodcastController from "@controllers/podcast";
import PodcastServices from "src/services/podcast";
import { authorize, isCreator } from "@middlewares/authorization";
import { handleFileUpload } from "@middlewares/uploadFile";

const router = express.Router();

router.post("/create", authorize, isCreator, handleFileUpload, PodcastController.create);
router.get("/", PodcastController.getAll);
router.get("/:id", PodcastController.get);
router.put("/update/:id", authorize, handleFileUpload, PodcastController.update);
router.delete("/delete/:id", PodcastController.remove);

router.get("/popular", PodcastServices.popularPodcasts);
router.get("/latest", PodcastServices.latestPodcasts);
router.post("/play/:id", authorize, PodcastServices.play);
router.post("/play-next/:id", authorize, PodcastServices.playNext);
router.post("/report", authorize, PodcastServices.reportPodcast);

export default router;
