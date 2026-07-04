import mongoose, { Schema } from "mongoose";
import { DOCUMENT_TYPES } from "../constants/status.constants.js";

const documentSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: Object.values(DOCUMENT_TYPES), required: true },
    originalName: { type: String, required: true },
    mimeType: String,
    size: Number,
    url: String,
    publicId: String,
    storageProvider: { type: String, enum: ["cloudinary", "demo"], default: "demo" },
    extractedData: { type: Schema.Types.Mixed, default: {} },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

documentSchema.index({ candidate: 1, type: 1 }, { unique: true });
documentSchema.index({ candidate: 1, uploadedAt: -1 });

export const Document = mongoose.model("Document", documentSchema);
