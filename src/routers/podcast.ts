import express from "express";
import PodcastController from "@controllers/podcast";
import { authorize } from "@middlewares/authorization";
import { handleFileUpload } from "@middlewares/uploadFile";
import { categoryValidator, subCategoryValidator } from "@middlewares/docValidator";

const router = express.Router();

router.post("/create", authorize, handleFileUpload, categoryValidator, subCategoryValidator, PodcastController.create);
router.get("/", PodcastController.getAll);
router.get("/:id", PodcastController.getById);
router.put("/update/:id", authorize, handleFileUpload, PodcastController.update);
router.delete("/delete/:id", PodcastController.remove);

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
