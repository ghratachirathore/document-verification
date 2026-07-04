import { isMongoEnabled } from "../config/env.js";
import { Document } from "../models/document.model.js";
import { isValidMongoObjectId } from "../utils/validators.js";
import { demoStore } from "./demoStore.service.js";

export const documentService = {
  async upsert(document) {
    if (!isMongoEnabled) return demoStore.upsertDocument(document);

    return Document.findOneAndUpdate(
      { candidate: document.candidate, type: document.type },
      document,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },
  async replace(documentId, candidateId, update) {
    if (!isMongoEnabled) return demoStore.replaceDocument(documentId, candidateId, update);
    if (!isValidMongoObjectId(documentId) || !isValidMongoObjectId(candidateId)) return null;
    return Document.findOneAndUpdate({ _id: documentId, candidate: candidateId }, update, { new: true });
  },
  async getByCandidate(candidateId) {
    if (!isMongoEnabled) return demoStore.getDocumentsByCandidate(candidateId);
    if (!isValidMongoObjectId(candidateId)) return [];
    return Document.find({ candidate: candidateId }).sort({ uploadedAt: -1 }).lean();
  }
};
