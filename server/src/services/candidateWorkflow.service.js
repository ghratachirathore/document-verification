import { DOCUMENT_TYPES } from "../constants/status.constants.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidDocumentType } from "../utils/validators.js";
import { documentService } from "./document.service.js";
import { geminiService } from "./gemini.service.js";
import { storageService } from "./storage.service.js";
import { userService } from "./user.service.js";
import { verificationService } from "./verification.service.js";

const getUserId = (user) => user?._id?.toString?.() || user?._id || user?.id;

const normalizeDocumentPayload = ({ candidateId, type, file, storedFile, extractedData }) => ({
  candidate: candidateId,
  type,
  originalName: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  ...storedFile,
  extractedData
});

export const candidateWorkflowService = {
  async getCandidateWorkspace(candidateId, candidate = null) {
    const resolvedCandidate = candidate || (await userService.findById(candidateId));
    if (!resolvedCandidate) {
      const fallbackCandidate = await userService.findByEmail(String(candidateId || "").toLowerCase(), false);
      if (fallbackCandidate?.role === "candidate") {
        return this.getCandidateWorkspace(fallbackCandidate._id || fallbackCandidate.id, fallbackCandidate);
      }
    }

    if (!resolvedCandidate || resolvedCandidate.role !== "candidate") {
      throw new ApiError(404, "Candidate not found");
    }

    const documents = await documentService.getByCandidate(candidateId);
    const verification = await verificationService.getLatest(candidateId);
    const summary = await verificationService.getSummary(candidateId);

    return {
      candidate: resolvedCandidate,
      documents,
      verification,
      summary
    };
  },

  async getCandidateReport(candidateId) {
    const verification = await verificationService.getLatest(candidateId);
    const summary = await verificationService.getSummary(candidateId);

    return { verification, summary };
  },

  async listCandidateDocuments(candidateId) {
    const documents = await documentService.getByCandidate(candidateId);
    return { documents };
  },

  async processCandidateDocumentUpload({ candidate, file, type, documentId = null }) {
    const candidateId = getUserId(candidate);
    if (!candidateId) throw new ApiError(401, "Authenticated candidate is required");
    if (!isValidDocumentType(type)) throw new ApiError(400, "Invalid document type");
    if (!file) throw new ApiError(400, "Document file is required");

    const storedFile = await storageService.uploadDocument(file, candidateId, type);
    const extractedData = await geminiService.extractDocument(file, type);
    const documentPayload = normalizeDocumentPayload({ candidateId, type, file, storedFile, extractedData });

    const document = documentId
      ? await documentService.replace(documentId, candidateId, documentPayload)
      : await documentService.upsert(documentPayload);

    if (!document) throw new ApiError(404, "Document not found");

    const documents = await documentService.getByCandidate(candidateId);
    const { profile, record } = verificationService.run(candidate, documents);
    const savedRecord = await verificationService.saveRecord(record);
    const summary = await geminiService.summarizeCandidate(profile, savedRecord);
    const savedSummary = await verificationService.saveSummary({
      candidate: candidateId,
      ...summary
    });

    const updatedCandidate = await userService.updateCandidateProfile(candidateId, {
      ...candidate.candidateProfile,
      ...profile,
      timeline: [
        {
          label: "Verification generated",
          detail: `Credential checks completed with ${record.overallConfidence}% confidence.`,
          actor: "System",
          status: "completed",
          createdAt: new Date()
        },
        ...(candidate.candidateProfile?.timeline || [])
      ],
      lastUpdated: new Date()
    });

    return {
      document,
      documents,
      verification: savedRecord,
      summary: savedSummary,
      candidate: updatedCandidate
    };
  }
};
