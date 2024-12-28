import http from "http";
import app from "./app";
import { connectDB } from "@connection/atlasDB";
import { initSocket } from "./socket";
import "dotenv/config";
import { logger } from "@shared/logger";
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;
initSocket(server);
async function startServer() {
    try {
        await connectDB();
        const server = http.createServer(app);
        server.listen(PORT, () => {
            logger.info(`Server is running at PORT: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
}

startServer();
