import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { rateLimit } from "./middlewares/rateLimit.middleware.js";
import { logger } from "./utils/logger.js";
import authRoutes from "./routes/auth.routes.js";
import candidateRoutes from "./routes/candidate.routes.js";
import documentRoutes from "./routes/document.routes.js";
import hrRoutes from "./routes/hr.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      logger.warn("CORS origin rejected", { origin, allowedOrigins: env.clientUrls });
      return callback(null, false);
    },
    credentials: true
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(rateLimit());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "EduVerify AI API is healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/hr", hrRoutes);

app.use(errorHandler);

export { app };
