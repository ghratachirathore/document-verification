import mongoose, { Schema } from "mongoose";
import { VERIFICATION_STATUS } from "../constants/status.constants.js";

const checkSchema = new Schema(
  {
    key: String,
    label: String,
    expected: Schema.Types.Mixed,
    observed: Schema.Types.Mixed,
    evidenceUsed: [String],
    confidence: Number,
    outcome: String,
    finalStatus: String,
    reason: String,
    recommendedAction: String
  },
  { _id: false }
);

const evidenceSchema = new Schema(
  {
    category: String,
    claim: String,
    evidenceUsed: [String],
    status: String,
    confidence: Number,
    reason: String
  },
  { _id: false }
);

const verificationRecordSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      required: true
    },
    overallConfidence: Number,
    checks: [checkSchema],
    evidence: [evidenceSchema],
    issues: [String],
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

verificationRecordSchema.index({ candidate: 1, generatedAt: -1 });
verificationRecordSchema.index({ status: 1, generatedAt: -1 });

export const VerificationRecord = mongoose.model("VerificationRecord", verificationRecordSchema);
