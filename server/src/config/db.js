import mongoose from "mongoose";
import { env, isMongoEnabled } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  if (!isMongoEnabled) {
    logger.warn("MongoDB URI not found. Running with in-memory demo store.");
    return null;
  }

  const connection = await mongoose.connect(env.mongoUri, {
    dbName: "eduverify_ai"
  });

  logger.info(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};
