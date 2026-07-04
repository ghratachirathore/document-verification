import dotenv from "dotenv";

dotenv.config();

const devJwtSecret = "eduverify-dev-secret-change-me";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || devJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || ""
  }
};

export const isMongoEnabled = Boolean(env.mongoUri);

export const isCloudinaryEnabled = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

export const isGeminiEnabled = Boolean(env.geminiApiKey);

export const validateEnvironment = () => {
  if (env.nodeEnv === "production" && env.jwtSecret === devJwtSecret) {
    throw new Error("JWT_SECRET must be set in production");
  }

  return {
    mongoMode: isMongoEnabled ? "mongodb" : "demo-store",
    storageMode: isCloudinaryEnabled ? "cloudinary" : "demo-storage",
    aiMode: isGeminiEnabled ? "gemini" : "demo-ai"
  };
};
