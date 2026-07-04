import { isMongoEnabled } from "../config/env.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidMongoObjectId } from "../utils/validators.js";
import { demoStore } from "./demoStore.service.js";

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : user;
  const { password, ...safeUser } = plain;
  return safeUser;
};

export const userService = {
  async createUser(payload) {
    if (!isMongoEnabled) {
      const user = await demoStore.createUser(payload);
      if (!user) throw new ApiError(409, "User already exists");
      return user;
    }

    const exists = await User.findOne({ email: payload.email.toLowerCase() });
    if (exists) throw new ApiError(409, "User already exists");

    const user = await User.create(payload);
    return sanitizeUser(user);
  },
  async findByEmail(email, includePassword = false) {
    if (!isMongoEnabled) return demoStore.findUserByEmail(email, includePassword);
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select("+password");
    return query;
  },
  async findById(id) {
    if (!isMongoEnabled) return demoStore.findUserById(id);
    if (!isValidMongoObjectId(id)) return null;
    return sanitizeUser(await User.findById(id).lean());
  },
  async verifyPassword(user, password) {
    if (!user) return false;
    if (!isMongoEnabled) return demoStore.verifyPassword(user, password);
    return user.isPasswordCorrect(password);
  },
  async updateCandidateProfile(candidateId, profile) {
    if (!isMongoEnabled) return demoStore.updateCandidateProfile(candidateId, profile);
    return sanitizeUser(
      await User.findByIdAndUpdate(
        candidateId,
        { $set: { candidateProfile: profile } },
        { new: true, runValidators: true }
      )
    );
  },
  async listCandidates(filters = {}) {
    if (!isMongoEnabled) return demoStore.listCandidates(filters);

    const query = { role: "candidate" };
    if (filters.status) query["candidateProfile.verificationStatus"] = filters.status;
    if (filters.branch) query["candidateProfile.branch"] = new RegExp(filters.branch, "i");
    if (filters.minCgpa || filters.maxCgpa) {
      query["candidateProfile.cgpa"] = {};
      if (filters.minCgpa) query["candidateProfile.cgpa"].$gte = Number(filters.minCgpa);
      if (filters.maxCgpa) query["candidateProfile.cgpa"].$lte = Number(filters.maxCgpa);
    }
    if (filters.search) {
      query.$or = [
        { name: new RegExp(filters.search, "i") },
        { "candidateProfile.extractedName": new RegExp(filters.search, "i") },
        { "candidateProfile.branch": new RegExp(filters.search, "i") },
        { "candidateProfile.skills": new RegExp(filters.search, "i") }
      ];
    }
    if (filters.skill) query["candidateProfile.skills"] = new RegExp(filters.skill, "i");
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
    if (!isMongoEnabled) return demoStore.addTimeline(candidateId, label, detail);
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
    if (!isMongoEnabled) return demoStore.addClarification(candidateId, message);
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
    if (!isMongoEnabled) return demoStore.updateHrDecision(candidateId, decision);
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
