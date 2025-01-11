"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const atlasDB_1 = require("./connection/atlasDB");
require("dotenv/config");
const logger_1 = require("./shared/logger");
const PORT = process.env.PORT || 8000;
async function startServer() {
    try {
        await (0, atlasDB_1.connectDB)();
        const server = http_1.default.createServer(app_1.default);
        server.listen(PORT, () => {
            logger_1.logger.info(`Server is running at PORT: ${PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start the server:", error);
    }
}
startServer();
