import mongoose from "mongoose";
import to from "await-to-ts";
import { logger } from "@shared/logger";

const connectDB = async (uri: string) => {
  const [error] = await to(mongoose.connect(uri));
  if (error) {
    console.error(error);
    return;
  }
  logger.info(`DB Connected Successfully on mongodb://127.0.0.1:27017`);
};

export default connectDB;
