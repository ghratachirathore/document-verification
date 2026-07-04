export const USER_ROLES = Object.freeze({
  CANDIDATE: "candidate",
  HR: "hr"
});

export const DOCUMENT_TYPES = Object.freeze({
  RESUME: "resume",
  MARKSHEET: "marksheet",
  INTERNSHIP_CERTIFICATE: "internshipCertificate"
});

export const VERIFICATION_STATUS = Object.freeze({
  VERIFIED: "Verified",
  MINOR_DIFFERENCES: "Verified With Minor Differences",
  NEEDS_REVIEW: "Needs Review",
  HIGH_RISK: "High Risk Inconsistency"
});

export const HR_DECISIONS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CLARIFICATION_REQUESTED: "clarification_requested"
});
