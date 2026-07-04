import { HR_DECISIONS } from "../constants/status.constants.js";
import { ApiError } from "../utils/ApiError.js";
import { analyticsService } from "./analytics.service.js";
import { candidateWorkflowService } from "./candidateWorkflow.service.js";
import { userService } from "./user.service.js";

const actionMap = {
  approve: HR_DECISIONS.APPROVED,
  reject: HR_DECISIONS.REJECTED,
  request_clarification: HR_DECISIONS.CLARIFICATION_REQUESTED
};

export const hrWorkflowService = {
  async getAnalytics() {
    const candidates = await userService.listCandidates();
    return analyticsService.build(candidates);
  },

  async listCandidates(filters) {
    const candidates = await userService.listCandidates(filters);
    return { candidates };
  },

  async getHrCandidateDetail(candidateId) {
    return candidateWorkflowService.getCandidateWorkspace(candidateId);
  },

  async performHrAction(candidateId, action, message = "") {
    const decision = actionMap[action];
    if (!decision) throw new ApiError(400, "Invalid HR action");

    const candidate =
      decision === HR_DECISIONS.CLARIFICATION_REQUESTED
        ? await userService.addClarification(
            candidateId,
            message || "Please clarify the highlighted credential inconsistency."
          )
        : await userService.updateHrDecision(candidateId, decision);

    if (!candidate) throw new ApiError(404, "Candidate not found");
    return { candidate };
  },

  async requestClarification(candidateId, message) {
    if (!message?.trim()) throw new ApiError(400, "Clarification message is required");
    const candidate = await userService.addClarification(candidateId, message.trim());
    if (!candidate) throw new ApiError(404, "Candidate not found");
    return { candidate };
  }
};
