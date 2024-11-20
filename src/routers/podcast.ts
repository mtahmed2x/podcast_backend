import express from "express";
import PodcastController from "@controllers/podcast";
import { authorize } from "@middlewares/authorization";
import { handleFileUpload } from "@middlewares/uploadFile";

const router = express.Router();

router.post(
  "/create",
  authorize(),
  handleFileUpload,
  PodcastController.createPodcast
);
// router.get("/", PodcastController.getPodcast);
// router.get("/:id", PodcastController.getPodcastById);
// router.put("/update/:id", uploadFile(), PodcastController.updatePodcast);
// router.delete("/delete/:id", PodcastController.deletePodcast);

// router.post(
//   "/comment/:id",
//   authorize(),
//   isActive() || isCreator(),
//   PodcastController.commentPodcast
// );
// router.post(
//   "/favorite/:id",
//   authorize(),
//   isActive(),
//   PodcastController.favoritePodcast
// );

// router.get("/play/:id", PodcastController.playPodcast);

export default router;
