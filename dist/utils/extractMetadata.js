"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageMetadata = exports.getAudioMetadata = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const fs_1 = __importDefault(require("fs"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
const getAudioMetadata = async (filePath) => {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(filePath, (error, metadata) => {
            if (error) {
                return reject(`Error reading audio file: ${error.message}`);
            }
            const formatData = metadata.format;
            const streamData = metadata.streams.find((stream) => stream.codec_type === "audio");
            if (!streamData || !formatData) {
                return reject("No audio stream found in file.");
            }
            const audioMetadata = {
                duration: formatData.duration ? +formatData.duration.toFixed(2) : 0,
                format: formatData.format_name ?? "unknown",
                size: formatData.size
                    ? +(formatData.size / (1024 * 1024)).toFixed(2)
                    : +(fs_1.default.statSync(filePath).size / (1024 * 1024)).toFixed(2),
            };
            resolve(audioMetadata);
        });
    });
};
exports.getAudioMetadata = getAudioMetadata;
const getImageMetadata = async (filePath) => {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(filePath, (error, metadata) => {
            if (error) {
                return reject(`Error reading image file: ${error.message}`);
            }
            const formatData = metadata.format;
            if (!formatData) {
                return reject("No image format data found.");
            }
            const streamData = metadata.streams.find((stream) => stream.codec_type === "video" || stream.codec_type === "image");
            if (!formatData || !streamData) {
                return reject("No image stream found.");
            }
            const imageMetadata = {
                format: streamData.codec_name ?? "unknown",
                size: formatData.size
                    ? +(formatData.size / (1024 * 1024)).toFixed(2)
                    : +(fs_1.default.statSync(filePath).size / (1024 * 1024)).toFixed(2),
            };
            resolve(imageMetadata);
        });
    });
};
exports.getImageMetadata = getImageMetadata;
