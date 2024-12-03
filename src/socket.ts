import { addOrRemoveLike } from "@events/like";
import { addNewComment } from "@events/comment";
import { updateLikeCount, updateCommentCount } from "@controllers/podcast";
import { addNotification, removeLikeNotification } from "@controllers/notification";
import { Server, Socket } from "socket.io";
import "dotenv/config";
import createError from "http-errors";
import { decodeToken } from "@utils/jwt";
import { Subject } from "@shared/enums";

let io: Server | undefined;

type LikePodcastData = {
  podcastId: string;
};
type CommentPodcastData = {
  podcastId: string;
  text: string;
};

export const initSocket = (server: any): void => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.headers.access_token as string | undefined;
    if (!token) return next(new Error("Authentication error: No token found"));

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      return next(createError(500, "JWT secret is not defined."));
    }

    const [error, data] = decodeToken(token, secret);
    if (error) return next(new Error(error.message));

    socket.data.user = data;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log("User authenticated and connected:", user.authId);

    socket.on("likePodcast", async (data: LikePodcastData) => {
      const value = await addOrRemoveLike(data.podcastId, user.userId);
      const totalLikes = await updateLikeCount(data.podcastId, value);
      io!.emit("likeUpdate", { totalLikes: totalLikes });
      if (value == 1) await addNotification(data.podcastId, user.userId, Subject.LIKE);
      if (value == -1) await removeLikeNotification(data.podcastId, user.userId);
    });

    socket.on("commentPodcast", async (data: CommentPodcastData) => {
      const comment = await addNewComment(data.podcastId, data.text, user.userId);
      console.log(comment);
      await updateCommentCount(data.podcastId);
      io!.emit("commentUpdate", { user: user.userId, comment: comment.text });
      await addNotification(data.podcastId, user.userId, Subject.COMMENT);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
