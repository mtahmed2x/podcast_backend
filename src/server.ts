import http from "http";
import app from "./app";
import connectDB from "@connection/db";
import { initSocket } from "./socket";
import "dotenv/config";
import { logger } from "@shared/logger";
const server = http.createServer(app);
const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 8000;
connectDB(process.env.MONGO_URI!).then(()=> logger.info(`DB Connected Successfully on mongodb://127.0.0.1:27017`));
initSocket(server);
server.listen(PORT, () => {
  logger.info(`App listening Successfully on http://${BASE_URL}:${PORT}`);
});




