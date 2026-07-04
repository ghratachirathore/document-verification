import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { candidateWorkflowService } from "../services/candidateWorkflow.service.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const candidateId = req.user._id?.toString?.() || req.user._id;
  const workspace = await candidateWorkflowService.getCandidateWorkspace(candidateId, req.user);

  return res.status(200).json(new ApiResponse(200, workspace, "Candidate profile fetched"));
});

export const getMyReport = asyncHandler(async (req, res) => {
  const candidateId = req.user._id?.toString?.() || req.user._id;
  const report = await candidateWorkflowService.getCandidateReport(candidateId);

  return res.status(200).json(new ApiResponse(200, report, "Verification report fetched"));
});
