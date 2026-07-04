import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { HR_DECISIONS, USER_ROLES, VERIFICATION_STATUS } from "../constants/status.constants.js";

const timelineSchema = new Schema(
  {
    label: { type: String, required: true },
    detail: { type: String, required: true },
    actor: { type: String, default: "System" },
    status: { type: String, enum: ["completed", "current", "blocked", "pending"], default: "completed" },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const clarificationSchema = new Schema(
  {
    message: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const candidateProfileSchema = new Schema(
  {
    extractedName: String,
    degree: String,
    branch: String,
    cgpa: Number,
    passingYear: Number,
    academicConsistency: {
      score: Number,
      status: String,
      summary: String
    },
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String]
      }
    ],
    internships: [
      {
        company: String,
        role: String,
        duration: String,
        hasProof: { type: Boolean, default: false }
      }
    ],
    technicalStrengths: [String],
    careerHighlights: [String],
    evidence: [
      {
        category: String,
        claim: String,
        evidenceUsed: [String],
        status: String,
        confidence: Number,
        reason: String
      }
    ],
    profileCompletion: { type: Number, default: 20 },
    lifecycleStage: { type: String, default: "Profile Created" },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.NEEDS_REVIEW
    },
    hrDecision: {
      type: String,
      enum: Object.values(HR_DECISIONS),
      default: HR_DECISIONS.PENDING
    },
    issues: [String],
    timeline: [timelineSchema],
    clarifications: [clarificationSchema],
    decisionHistory: [
      {
        action: String,
        detail: String,
        actor: { type: String, default: "HR" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    lastVerificationRun: Date,
    lastUpdated: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.CANDIDATE },
    candidateProfile: { type: candidateProfileSchema, default: undefined }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.isPasswordCorrect = function isPasswordCorrect(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.index({ role: 1, updatedAt: -1 });
userSchema.index({ "candidateProfile.verificationStatus": 1 });
userSchema.index({ "candidateProfile.hrDecision": 1 });
userSchema.index({ "candidateProfile.branch": 1 });
userSchema.index({ "candidateProfile.skills": 1 });

export const User = mongoose.model("User", userSchema);
