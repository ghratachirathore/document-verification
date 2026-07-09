import { env, isMongoEnabled } from "../config/env.js";
import { VERIFICATION_STATUS } from "../constants/status.constants.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidMongoObjectId } from "../utils/validators.js";
import { demoStore } from "./demoStore.service.js";

const demoEmailSet = new Set(["candidate@eduverify.ai", "hr@eduverify.ai"]);
const shouldUseDemoStoreForEmail = (email) => {
  if (!isMongoEnabled) return true;
  if (env.nodeEnv !== "production") {
    return demoEmailSet.has(String(email || "").toLowerCase());
  }
  return false;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : user;
  const { password, ...safeUser } = plain;
  return safeUser;
};

const riskStatusMap = {
  low: VERIFICATION_STATUS.VERIFIED,
  minor: VERIFICATION_STATUS.MINOR_DIFFERENCES,
  review: VERIFICATION_STATUS.NEEDS_REVIEW,
  high: VERIFICATION_STATUS.HIGH_RISK
};

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const textRegex = (value) => new RegExp(escapeRegex(value), "i");

export const userService = {
  async createUser(payload) {
    if (!isMongoEnabled) {
      const user = await demoStore.createUser(payload);
      if (!user) throw new ApiError(409, "User already exists");
      return user;
    }

    try {
      const exists = await User.findOne({ email: payload.email.toLowerCase() });
      if (exists) throw new ApiError(409, "User already exists");

      const user = await User.create(payload);
      return sanitizeUser(user);
    } catch (error) {
      if (env.nodeEnv !== "production") {
        const fallbackUser = await demoStore.createUser(payload);
        if (!fallbackUser) throw new ApiError(409, "User already exists");
        return fallbackUser;
      }
      throw error;
    }
  },
  async findByEmail(email, includePassword = false) {
    if (shouldUseDemoStoreForEmail(email)) return demoStore.findUserByEmail(email, includePassword);

    try {
      const query = User.findOne({ email: email.toLowerCase() });
      if (includePassword) query.select("+password");
      const user = await query;
      if (user) return includePassword ? user : sanitizeUser(user);
      if (env.nodeEnv !== "production") return demoStore.findUserByEmail(email, includePassword);
      return null;
    } catch (error) {
      if (env.nodeEnv !== "production") return demoStore.findUserByEmail(email, includePassword);
      throw error;
    }
  },
  async findById(id) {
    if (!id) return null;
    if (!isMongoEnabled || env.nodeEnv !== "production" || !isValidMongoObjectId(id)) {
      return demoStore.findUserById(id);
    }

    try {
      const user = await User.findById(id).lean();
      return sanitizeUser(user);
    } catch (error) {
      if (env.nodeEnv !== "production") return demoStore.findUserById(id);
      throw error;
    }
  },
  async verifyPassword(user, password) {
    if (!user) return false;
    if (!isMongoEnabled) return demoStore.verifyPassword(user, password);
    if (typeof user.isPasswordCorrect === "function") return user.isPasswordCorrect(password);
    if (typeof user.password === "string") return demoStore.verifyPassword(user, password);
    return false;
  },
  async updateCandidateProfile(candidateId, profile) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.updateCandidateProfile(candidateId, profile);
    return sanitizeUser(
      await User.findByIdAndUpdate(
        candidateId,
        { $set: { candidateProfile: profile } },
        { new: true, runValidators: true }
      )
    );
  },
  async listCandidates(filters = {}) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.listCandidates(filters);

    const query = { role: "candidate" };
    const riskStatus = filters.riskLevel ? riskStatusMap[filters.riskLevel] : null;
    if (filters.status && riskStatus && filters.status !== riskStatus) query["candidateProfile.verificationStatus"] = "__no_status_match__";
    else if (riskStatus) query["candidateProfile.verificationStatus"] = riskStatus;
    else if (filters.status) query["candidateProfile.verificationStatus"] = filters.status;
    if (filters.branch) query["candidateProfile.branch"] = textRegex(filters.branch);
    if (filters.degree) query["candidateProfile.degree"] = textRegex(filters.degree);
    if (filters.minCgpa || filters.maxCgpa) {
      query["candidateProfile.cgpa"] = {};
      if (filters.minCgpa) query["candidateProfile.cgpa"].$gte = Number(filters.minCgpa);
      if (filters.maxCgpa) query["candidateProfile.cgpa"].$lte = Number(filters.maxCgpa);
    }
    if (filters.search) {
      query.$or = [
        { name: textRegex(filters.search) },
        { "candidateProfile.extractedName": textRegex(filters.search) },
        { "candidateProfile.degree": textRegex(filters.search) },
        { "candidateProfile.branch": textRegex(filters.search) },
        { "candidateProfile.verificationStatus": textRegex(filters.search) },
        { "candidateProfile.issues": textRegex(filters.search) },
        { "candidateProfile.skills": textRegex(filters.search) }
      ];
    }
    if (filters.skill) query["candidateProfile.skills"] = textRegex(filters.skill);
    if (filters.internshipVerified === "true") query["candidateProfile.internships.hasProof"] = true;
    if (filters.internshipVerified === "false") query["candidateProfile.internships.hasProof"] = { $ne: true };
    if (filters.awaitingReview === "true") query["candidateProfile.hrDecision"] = "pending";
    if (filters.clarificationPending === "true") query["candidateProfile.clarifications.status"] = "open";
    if (filters.uploadedToday === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      query["candidateProfile.lastUpdated"] = { $gte: start };
    }

    return (await User.find(query).sort({ updatedAt: -1 }).lean()).map(sanitizeUser);
  },
  async addTimeline(candidateId, label, detail) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.addTimeline(candidateId, label, detail);
    return sanitizeUser(
      await User.findByIdAndUpdate(
        candidateId,
        {
          $push: {
            "candidateProfile.timeline": {
              $each: [{ label, detail, createdAt: new Date() }],
              $position: 0
            }
          },
          $set: { "candidateProfile.lastUpdated": new Date() }
        },
        { new: true }
      )
    );
  },
  async addClarification(candidateId, message) {
    const decisionEvent = { action: "clarification_requested", detail: message, actor: "HR", createdAt: new Date() };
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.addClarification(candidateId, message);
    return sanitizeUser(
      await User.findByIdAndUpdate(
        candidateId,
        {
          $push: {
            "candidateProfile.clarifications": {
              $each: [{ message, status: "open", createdAt: new Date() }],
              $position: 0
            },
            "candidateProfile.timeline": {
              $each: [{ label: "Clarification requested", detail: message, createdAt: new Date() }],
              $position: 0
            },
            "candidateProfile.decisionHistory": {
              $each: [decisionEvent],
              $position: 0
            }
          },
          $set: {
            "candidateProfile.hrDecision": "clarification_requested",
            "candidateProfile.lifecycleStage": "Clarification Requested",
            "candidateProfile.lastUpdated": new Date()
          }
        },
        { new: true }
      )
    );
  },
  async updateHrDecision(candidateId, decision) {
    const decisionEvent = {
      action: decision,
      detail: `Candidate lifecycle moved to ${decision}.`,
      actor: "HR",
      createdAt: new Date()
    };
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.updateHrDecision(candidateId, decision);
    return sanitizeUser(
      await User.findByIdAndUpdate(
        candidateId,
        {
          $set: {
            "candidateProfile.hrDecision": decision,
            "candidateProfile.lifecycleStage": decision === "approved" ? "Approved" : "Rejected",
            "candidateProfile.lastUpdated": new Date()
          },
          $push: {
            "candidateProfile.timeline": {
              $each: [
                {
                  label: `HR ${decision.replace("_", " ")}`,
                  detail: `Candidate lifecycle moved to ${decision}.`,
                  createdAt: new Date()
                }
              ],
              $position: 0
            },
            "candidateProfile.decisionHistory": {
              $each: [decisionEvent],
              $position: 0
            }
          }
        },
        { new: true }
      )
    );
  }
};
