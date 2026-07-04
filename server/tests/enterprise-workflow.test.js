import assert from "node:assert/strict";
import test from "node:test";
import { VERIFICATION_STATUS } from "../src/constants/status.constants.js";
import { analyticsService } from "../src/services/analytics.service.js";
import { verificationService } from "../src/services/verification.service.js";

test("verification service generates evidence and recommended HR actions", () => {
  const candidate = { _id: "candidate-1", name: "Aman Sharma" };
  const documents = [
    {
      type: "resume",
      extractedData: {
        name: "Aman Sharma",
        branch: "Computer Science",
        cgpa: 8.4,
        passingYear: 2025,
        skills: ["React", "Node.js"],
        projects: [{ title: "Placement Portal", description: "MERN app", technologies: ["React"] }],
        internships: [{ company: "TechNova", role: "Intern", duration: "2 months" }]
      }
    },
    {
      type: "marksheet",
      extractedData: {
        name: "Aman K Sharma",
        branch: "Computer Science",
        cgpa: 8.4,
        passingYear: 2025
      }
    },
    {
      type: "internshipCertificate",
      extractedData: {
        name: "Aman Sharma",
        internships: [{ company: "TechNova", role: "Intern", duration: "2 months" }]
      }
    }
  ];

  const { profile, record } = verificationService.run(candidate, documents);

  assert.ok(profile.evidence.length >= 5);
  assert.ok(record.checks.every((check) => check.evidenceUsed.length));
  assert.ok(record.checks.every((check) => check.recommendedAction));
  assert.equal(profile.lifecycleStage, "Verification Engine Completed");
  assert.equal(profile.academicConsistency.status, "Match");
});

test("analytics service builds recruiter intelligence metrics and filters", () => {
  const candidates = [
    {
      _id: "1",
      name: "Neha",
      updatedAt: new Date(),
      candidateProfile: {
        branch: "Computer Science",
        skills: ["React"],
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        hrDecision: "pending",
        lastUpdated: new Date(),
        lastVerificationRun: new Date(),
        internships: [{ hasProof: true }],
        evidence: [{ confidence: 98 }],
        issues: [],
        clarifications: []
      }
    },
    {
      _id: "2",
      name: "Rahul",
      updatedAt: new Date(),
      candidateProfile: {
        branch: "Electronics",
        skills: ["Node.js"],
        verificationStatus: VERIFICATION_STATUS.NEEDS_REVIEW,
        hrDecision: "clarification_requested",
        lastUpdated: new Date(),
        internships: [{ hasProof: false }],
        evidence: [{ confidence: 70 }],
        issues: ["Internship Evidence Validation: Needs Review"],
        clarifications: [{ status: "open" }]
      }
    }
  ];

  const analytics = analyticsService.build(candidates);

  assert.equal(analytics.overview.totalCandidates, 2);
  assert.equal(analytics.overview.awaitingHrReview, 1);
  assert.equal(analytics.overview.uploadedToday, 2);
  assert.equal(analytics.internship.missingProof, 1);
  assert.equal(analytics.trends.pendingClarifications.length, 1);
  assert.ok(analytics.hiringInsights.some((item) => item.label.includes("React")));
});
