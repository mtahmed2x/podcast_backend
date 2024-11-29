import mongoose from "mongoose";
import to from "await-to-ts";
import { logger } from "@shared/logger";

const connectDB = async (uri: string) => {
  const [error] = await to(mongoose.connect(uri));
  if (error) {
    console.error(error);
    return;
  }
};

export default connectDB;
