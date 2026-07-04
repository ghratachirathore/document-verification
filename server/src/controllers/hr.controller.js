import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hrWorkflowService } from "../services/hrWorkflow.service.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await hrWorkflowService.getAnalytics();

  return res.status(200).json(new ApiResponse(200, analytics, "HR analytics fetched"));
});

export const listCandidates = asyncHandler(async (req, res) => {
  const payload = await hrWorkflowService.listCandidates(req.query);

  return res.status(200).json(new ApiResponse(200, payload, "Candidates fetched"));
});

export const getCandidateDetail = asyncHandler(async (req, res) => {
  const detail = await hrWorkflowService.getHrCandidateDetail(req.params.id);

  return res.status(200).json(new ApiResponse(200, detail, "Candidate detail fetched"));
});

export const updateCandidateAction = asyncHandler(async (req, res) => {
  const payload = await hrWorkflowService.performHrAction(req.params.id, req.body.action, req.body.message);

  return res.status(200).json(new ApiResponse(200, payload, "Candidate action updated"));
});

export const requestClarification = asyncHandler(async (req, res) => {
  const payload = await hrWorkflowService.requestClarification(req.params.id, req.body.message);

  return res.status(201).json(new ApiResponse(201, payload, "Clarification requested"));
});
