import http from "http";
import app from "./app";
import connectDB from "@connection/db";
import { initSocket } from "./socket";
import "dotenv/config";
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
connectDB(process.env.MONGO_URI!);
initSocket(server);
server.listen(PORT, process.env.BASE_URL as any, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
