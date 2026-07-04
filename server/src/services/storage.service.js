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

export const storageService = {
  async uploadDocument(file, candidateId, type) {
    if (!isCloudinaryEnabled) {
      logger.debug("Using demo document storage", { candidateId, type, originalName: file.originalname });
      return {
        url: `demo://eduverify/${candidateId}/${type}/${encodeURIComponent(file.originalname)}`,
        publicId: `demo-${candidateId}-${type}`,
        storageProvider: "demo"
      };
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
      logger.error("Cloudinary document upload failed", error);
      throw error;
    }
  }
};
