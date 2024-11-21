import { decode } from "@middlewares/authorization";
import { likeToggle } from "@events/likeToggle";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

let io: Server | undefined;

interface LikePodcastData {
  podcastId: string;
}

export const initSocket = (server: any): void => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.headers.access_token as string | undefined;
    if (!token) {
      return next(new Error("Authentication error: Toke required"));
    }
    const [error, user] = await decode(token);

    try {
      socket.data.user = user;
      console.log(user);
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    if (!user) {
      console.error("User data not found");
      return;
    }

    console.log("User authenticated and connected:", user.authId);

    socket.on("likePodcast", async (data: LikePodcastData) => {
      try {
        await likeToggle(data.podcastId, user.userId, io!);
      } catch (err) {
        console.error("Error handling 'likePodcast' event:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
