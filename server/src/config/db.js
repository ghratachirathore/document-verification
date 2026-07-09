import mongoose from "mongoose";
import { env, isMongoEnabled, setMongoEnabled } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  if (!env.mongoUri || isMongoEnabled === false) {
    logger.warn("MongoDB URI not found. Running with in-memory demo store.");
    setMongoEnabled(false);
    return null;
  }

  try {
    const connection = await mongoose.connect(env.mongoUri, {
      dbName: "eduverify_ai"
    });

    setMongoEnabled(true);
    logger.info(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    setMongoEnabled(false);
    logger.warn("MongoDB connection failed. Falling back to in-memory demo store.", error);
    return null;
  }
};
