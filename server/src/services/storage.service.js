import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary.js";
import { isCloudinaryEnabled } from "../config/env.js";
import { logger } from "../utils/logger.js";

const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

const fallbackStorage = (candidateId, type, file) => ({
  url: `demo://eduverify/${candidateId}/${type}/${encodeURIComponent(file.originalname)}`,
  publicId: `demo-${candidateId}-${type}`,
  storageProvider: "demo"
});

export const storageService = {
  async uploadDocument(file, candidateId, type) {
    if (!isCloudinaryEnabled) {
      logger.debug("Using demo document storage", { candidateId, type, originalName: file.originalname });
      return fallbackStorage(candidateId, type, file);
    }

    try {
      const result = await uploadBufferToCloudinary(file, `eduverify-ai/${candidateId}/${type}`);
      logger.info("Document uploaded to Cloudinary", { candidateId, type, publicId: result.public_id });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageProvider: "cloudinary"
      };
    } catch (error) {
      logger.warn("Cloudinary upload failed, falling back to demo storage", {
        candidateId,
        type,
        originalName: file.originalname,
        error: error?.message || error
      });
      return fallbackStorage(candidateId, type, file);
    }
  }
};
