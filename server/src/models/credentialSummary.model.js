import mongoose, { Schema } from "mongoose";

const credentialSummarySchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    summary: { type: String, required: true },
    strengths: [String],
    risks: [String],
    generatedBy: { type: String, enum: ["gemini", "demo"], default: "demo" },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

credentialSummarySchema.index({ candidate: 1, generatedAt: -1 });

export const CredentialSummary = mongoose.model("CredentialSummary", credentialSummarySchema);
