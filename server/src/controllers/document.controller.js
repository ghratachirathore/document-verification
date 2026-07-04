import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { candidateWorkflowService } from "../services/candidateWorkflow.service.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const workflow = await candidateWorkflowService.processCandidateDocumentUpload({
    candidate: req.user,
    file: req.file,
    type: req.body.type
  });

  return res.status(201).json(new ApiResponse(201, workflow, "Document uploaded and processed"));
});

export const replaceDocument = asyncHandler(async (req, res) => {
  const workflow = await candidateWorkflowService.processCandidateDocumentUpload({
    candidate: req.user,
    file: req.file,
    type: req.body.type,
    documentId: req.params.id
  });

  return res.status(200).json(new ApiResponse(200, workflow, "Document replaced and reprocessed"));
});

export const listDocuments = asyncHandler(async (req, res) => {
  const candidateId = req.user._id?.toString?.() || req.user._id;
  const payload = await candidateWorkflowService.listCandidateDocuments(candidateId);

  return res.status(200).json(new ApiResponse(200, payload, "Documents fetched"));
});
