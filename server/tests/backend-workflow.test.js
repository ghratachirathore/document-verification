import assert from "node:assert/strict";
import test from "node:test";
import { candidateWorkflowService } from "../src/services/candidateWorkflow.service.js";
import { hrWorkflowService } from "../src/services/hrWorkflow.service.js";
import { userService } from "../src/services/user.service.js";
import { isValidEmail, isValidHrAction, isValidResourceId } from "../src/utils/validators.js";

test("candidate workflow service assembles candidate workspace and report", async () => {
  const candidate = await userService.findByEmail("candidate@eduverify.ai");
  const candidateId = candidate._id?.toString?.() || candidate._id;

  const workspace = await candidateWorkflowService.getCandidateWorkspace(candidateId, candidate);
  assert.equal(workspace.candidate.email, "candidate@eduverify.ai");
  assert.ok(Array.isArray(workspace.documents));
  assert.ok(workspace.verification);

  const report = await candidateWorkflowService.getCandidateReport(candidateId);
  assert.ok(report.verification);
  assert.ok(report.summary);
});

test("candidate workflow service processes document upload through verification pipeline", async () => {
  const candidate = await userService.findByEmail("candidate@eduverify.ai");

  const result = await candidateWorkflowService.processCandidateDocumentUpload({
    candidate,
    type: "resume",
    file: {
      originalname: "aman-resume.pdf",
      mimetype: "application/pdf",
      size: 128,
      buffer: Buffer.from("%PDF-1.4 workflow")
    }
  });

  assert.equal(result.document.type, "resume");
  assert.ok(result.verification.checks.length);
  assert.ok(result.summary.summary);
  assert.ok(result.candidate.candidateProfile.evidence.length);
});

test("HR workflow service provides detail and performs actions", async () => {
  const list = await hrWorkflowService.listCandidates({ awaitingReview: "true" });
  assert.ok(list.candidates.length >= 1);

  const candidateId = list.candidates[0]._id;
  const detail = await hrWorkflowService.getHrCandidateDetail(candidateId);
  assert.equal(detail.candidate._id, candidateId);

  const action = await hrWorkflowService.performHrAction(candidateId, "request_clarification", "Please upload proof.");
  assert.equal(action.candidate.candidateProfile.hrDecision, "clarification_requested");
});

test("validator helpers handle common backend input cases", () => {
  assert.equal(isValidEmail("hr@eduverify.ai"), true);
  assert.equal(isValidEmail("bad-email"), false);
  assert.equal(isValidHrAction("approve"), true);
  assert.equal(isValidHrAction("archive"), false);
  assert.equal(isValidResourceId("123456789012"), true);
});
