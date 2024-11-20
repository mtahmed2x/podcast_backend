import Podcast from "@models/podcast";
import Like from "@models/like";
import { Server, Socket } from "socket.io";
const { updateLike } = require("../podcast/podcast.controller");
import {
  increaseLikeNotification,
  decreaseLikeNotification,
} from "@controllers/notification";

const to = require("await-to-js").default;

export const likeToggle = async (id: string, userId: string, io: Server) => {
  let podcast = await Podcast.findById(id);
  let like = await Like.findOne({ podcast: id, user: userId });
  let value;
  if (!like) {
    like = await Like.create({ podcast: id, user: userId });
    value = 1;
  } else {
    await Like.deleteOne({ podcast: id, user: userId });
    value = -1;
  }
  podcast = await updateLike(id, value);
  if (value === 1) await increaseLikeNotification(id, userId);
  if (value === -1) await decreaseLikeNotification(id, userId);
  io.emit("likeUpdate", { totalLikes: podcast!.totalLikes });
};
