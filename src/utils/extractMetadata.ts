import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath as string);

type AudioMetadata = {
  duration: number;
  format: string;
  size: number;
};

type ImageMetadata = {
  format: string;
  size: number;
};

export const getAudioMetadata = async (filePath: string): Promise<AudioMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        return reject(`Error reading audio file: ${error.message}`);
      }
      const formatData = metadata.format;
      const streamData = metadata.streams.find((stream) => stream.codec_type === "audio");
      if (!streamData || !formatData) {
        return reject("No audio stream found in file.");
      }
      const audioMetadata: AudioMetadata = {
        duration: formatData.duration ? +formatData.duration.toFixed(2) : 0,
        format: formatData.format_name ?? "unknown",
        size: formatData.size
          ? +(formatData.size / (1024 * 1024)).toFixed(2)
          : +(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2),
      };
      resolve(audioMetadata);
    });
  });
};

export const getImageMetadata = async (filePath: string): Promise<ImageMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        return reject(`Error reading image file: ${error.message}`);
      }

      const formatData = metadata.format;
      if (!formatData) {
        return reject("No image format data found.");
      }

      const streamData = metadata.streams.find(
        (stream) => stream.codec_type === "video" || stream.codec_type === "image",
      );

      if (!formatData || !streamData) {
        return reject("No image stream found.");
      }

      const imageMetadata: ImageMetadata = {
        format: streamData.codec_name ?? "unknown",
        size: formatData.size
          ? +(formatData.size / (1024 * 1024)).toFixed(2)
          : +(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2),
      };

      resolve(imageMetadata);
    });
  });
};
