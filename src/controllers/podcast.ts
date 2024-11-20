import to from "await-to-ts";
import { Request, Response } from "express";
import { getAudioMetadata, getImageMetadata } from "@utils/extractMetadata";
import handleError from "@utils/handleError";
import Podcast from "@models/podcast";

type PodcastFileFields = {
  audio: Express.Multer.File[];
  cover: Express.Multer.File[];
};
type PodcastPayload = {
  categoryId: string;
  subCategoryId: string;
  title: string;
  description: string;
  location: string;
};
type PodcastRequest = Request<{}, {}, PodcastPayload> & {
  files: PodcastFileFields;
};

const createPodcast = async (req: Request, res: Response): Promise<any> => {
  const podcastReq = req as PodcastRequest;
  const creatorId = req.user.creatorId;
  const { audio, cover } = podcastReq.files;
  const { categoryId, subCategoryId, title, description, location } =
    podcastReq.body;

  const audio_path = audio[0].path;
  const cover_path = cover[0].path;
  const audioMetadata = await getAudioMetadata(audio_path);
  const imageMetadata = await getImageMetadata(cover_path);

  const [error, podcast] = await to(
    Podcast.create({
      creator: creatorId,
      category: categoryId,
      subCategory: subCategoryId,
      title: title,
      description: description,
      location: location,
      cover: cover_path,
      coverFormat: imageMetadata.format,
      coverSize: imageMetadata.size,
      audio: audio_path,
      audioFormat: audioMetadata.format,
      audioSize: audioMetadata.size,
      audioDuration: audioMetadata.duration,
    })
  );
  if (error) return handleError(error, res);

  return res.status(201).json({
    message: "Podcast created.",
    data: podcast,
  });
};
const PodcastController = {
  createPodcast,
};

export default PodcastController;
