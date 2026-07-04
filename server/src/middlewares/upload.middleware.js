import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      logger.warn("Rejected unsupported upload type", { mimetype: file.mimetype, originalName: file.originalname });
      return cb(new ApiError(400, "Only PDF, Word, JPG, and PNG files are supported"));
    }

    return cb(null, true);
  }
});
