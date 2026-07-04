import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : err.name === "MulterError" ? 400 : err.statusCode || 500;
  const message =
    err instanceof ApiError
      ? err.message
      : err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE"
        ? "Uploaded file exceeds the allowed size"
        : err.message;
  const error = err instanceof ApiError ? err : new ApiError(statusCode, message);

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} failed`, err);
  } else {
    logger.debug(`${req.method} ${req.originalUrl} rejected`, { statusCode: error.statusCode, message: error.message });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
