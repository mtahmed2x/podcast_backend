import to from "await-to-ts";
import { Request, Response } from "express";
import { parseFile } from "music-metadata";
import handleError from "@utils/handleError";
import Podcast from "@models/podcast";

type PodcastFileFields = {
  audio: Express.Multer.File[];
  cover: Express.Multer.File[];
};

type PodcastPayload = {
  categoryId: string;
  title: string;
  description: string;
  location: string;
};

type PodcastRequest = Request<{}, {}, PodcastPayload> & {
  files: PodcastFileFields;
};

const createPodcast = async (
  req: PodcastRequest,
  res: Response
): Promise<any> => {
  const { audio, cover } = req.files;
  console.log(audio);
  console.log(cover);
  const { categoryId, title, description, location } = req.body;
  const creatorId = req.user.creatorId;
  const audio_path = audio[0].path;
  const audio_size = (audio[0].size / (1024 * 1024)).toFixed(2);
  const metadata = await parseFile(audio_path);
  const a_duration = metadata.format.duration.toFixed(2);

  const cp_path = coverPhoto[0].path;

  const [error, podcast] = await to(
    Podcast.create({
      creator: creatorId,
      category: categoryId,
      title: title,
      description: description,
      location: location,
      audio: a_path,
      size: a_size,
      duration: a_duration,
      coverPhoto: cp_path,
    })
  );
  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json({
    message: "Podcast created.",
    data: podcast,
  });
};
