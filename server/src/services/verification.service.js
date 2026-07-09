import { DOCUMENT_TYPES, VERIFICATION_STATUS } from "../constants/status.constants.js";
import { CredentialSummary } from "../models/credentialSummary.model.js";
import { VerificationRecord } from "../models/verificationRecord.model.js";
import { averageScore, confidenceLabel, similarityScore, statusFromScore } from "../utils/match.util.js";
import { env, isMongoEnabled } from "../config/env.js";
import { demoStore } from "./demoStore.service.js";
import { isValidMongoObjectId } from "../utils/validators.js";

const getDocument = (documents, type) => documents.find((document) => document.type === type);
const hasDocument = (documents, type) => Boolean(getDocument(documents, type));

const numberScore = (left, right, tolerance = 0) => {
  if (left === undefined || right === undefined || left === null || right === null) return 40;
  return Math.abs(Number(left) - Number(right)) <= tolerance ? 100 : 40;
};

const recommendedAction = (score) => {
  if (score >= 95) return "No action required";
  if (score >= 85) return "Review but do not block";
  if (score >= 65) return "Request clarification or inspect evidence";
  return "Escalate before approval";
};

const makeCheck = ({ key, label, expected, observed, evidenceUsed, confidence, reason }) => {
  const outcome = confidenceLabel(confidence);
  return {
    key,
    label,
    expected,
    observed,
    evidenceUsed,
    confidence,
    outcome,
    finalStatus: outcome,
    reason,
    recommendedAction: recommendedAction(confidence)
  };
};

const makeEvidence = ({ category, claim, evidenceUsed, confidence, reason }) => ({
  category,
  claim,
  evidenceUsed,
  status: confidenceLabel(confidence),
  confidence,
  reason
});

const aggregateProfile = (candidate, documents) => {
  const resume = getDocument(documents, DOCUMENT_TYPES.RESUME)?.extractedData || {};
  const marksheet = getDocument(documents, DOCUMENT_TYPES.MARKSHEET)?.extractedData || {};
  const certificate = getDocument(documents, DOCUMENT_TYPES.INTERNSHIP_CERTIFICATE)?.extractedData || {};
  const internships = resume.internships || certificate.internships || [];
  const skills = [...new Set([...(resume.skills || []), ...(marksheet.skills || [])])];
  const projects = (resume.projects || []).map((project) =>
    typeof project === "string"
      ? { title: project, description: "Project extracted from resume evidence.", technologies: [] }
      : project
  );

  return {
    degree: marksheet.degree || resume.degree || "Bachelor of Technology",
    extractedName: marksheet.name || resume.name || certificate.name || candidate.name,
    branch: marksheet.branch || resume.branch,
    cgpa: marksheet.cgpa ?? resume.cgpa,
    passingYear: marksheet.passingYear ?? resume.passingYear,
    skills,
    projects,
    internships: internships.map((internship) => ({
      ...internship,
      hasProof: Boolean(certificate.internships?.length)
    })),
    technicalStrengths: skills.slice(0, 4).map((skill) => `${skill} exposure detected`),
    careerHighlights: [
      projects.length ? `${projects.length} project${projects.length > 1 ? "s" : ""} extracted from resume` : "Projects pending extraction",
      internships.length ? "Internship history available" : "Internship evidence pending",
      skills.length ? `${skills.length} technical skills identified` : "Skills pending extraction"
    ]
  };
};

export const verificationService = {
  buildCandidateProfile(candidate, documents) {
    const profile = aggregateProfile(candidate, documents);
    const requiredFields = ["extractedName", "branch", "cgpa", "passingYear"];
    const completeFields = requiredFields.filter((field) => profile[field] !== undefined && profile[field] !== null && profile[field] !== "");
    const documentCompletion = Math.round((documents.length / 3) * 40);
    const fieldCompletion = Math.round((completeFields.length / requiredFields.length) * 40);
    const skillsCompletion = profile.skills.length ? 10 : 0;
    const internshipCompletion = profile.internships.length ? 10 : 0;

    return {
      ...profile,
      profileCompletion: Math.min(100, documentCompletion + fieldCompletion + skillsCompletion + internshipCompletion)
    };
  },
  run(candidate, documents) {
    const profile = this.buildCandidateProfile(candidate, documents);
    const resume = getDocument(documents, DOCUMENT_TYPES.RESUME)?.extractedData || {};
    const marksheet = getDocument(documents, DOCUMENT_TYPES.MARKSHEET)?.extractedData || {};
    const certificate = getDocument(documents, DOCUMENT_TYPES.INTERNSHIP_CERTIFICATE)?.extractedData || {};

    const nameScore = similarityScore(resume.name || candidate.name, marksheet.name || certificate.name || profile.extractedName);
    const cgpaScore = numberScore(resume.cgpa ?? marksheet.cgpa, marksheet.cgpa ?? resume.cgpa, 0.05);
    const branchScore = similarityScore(resume.branch || profile.branch, marksheet.branch || profile.branch);
    const yearScore = numberScore(resume.passingYear ?? marksheet.passingYear, marksheet.passingYear ?? resume.passingYear, 0);
    const internshipScore = profile.internships?.length ? (certificate.internships?.length ? 95 : 62) : 70;

    const checks = [
      makeCheck({
        key: "name",
        label: "Name Match",
        expected: resume.name || candidate.name,
        observed: marksheet.name || certificate.name || profile.extractedName,
        evidenceUsed: ["Resume", "Marksheet", "Internship Certificate"].filter((_, index) =>
          [hasDocument(documents, DOCUMENT_TYPES.RESUME), hasDocument(documents, DOCUMENT_TYPES.MARKSHEET), hasDocument(documents, DOCUMENT_TYPES.INTERNSHIP_CERTIFICATE)][index]
        ),
        confidence: nameScore,
        reason: "Compares candidate name across resume, marksheet, and certificate evidence."
      }),
      makeCheck({
        key: "cgpa",
        label: "CGPA Match",
        expected: resume.cgpa ?? marksheet.cgpa,
        observed: marksheet.cgpa ?? resume.cgpa,
        evidenceUsed: hasDocument(documents, DOCUMENT_TYPES.MARKSHEET) ? ["Marksheet"] : ["Resume"],
        confidence: cgpaScore,
        reason: "Compares CGPA extracted from academic and profile evidence."
      }),
      makeCheck({
        key: "branch",
        label: "Branch Match",
        expected: resume.branch || profile.branch,
        observed: marksheet.branch || profile.branch,
        evidenceUsed: ["Resume", "Marksheet"].filter((_, index) =>
          [hasDocument(documents, DOCUMENT_TYPES.RESUME), hasDocument(documents, DOCUMENT_TYPES.MARKSHEET)][index]
        ),
        confidence: branchScore,
        reason: "Compares academic branch across available documents."
      }),
      makeCheck({
        key: "passingYear",
        label: "Passing Year Match",
        expected: resume.passingYear ?? marksheet.passingYear,
        observed: marksheet.passingYear ?? resume.passingYear,
        evidenceUsed: hasDocument(documents, DOCUMENT_TYPES.MARKSHEET) ? ["Marksheet"] : ["Resume"],
        confidence: yearScore,
        reason: "Compares passing year across available academic records."
      }),
      makeCheck({
        key: "internship",
        label: "Internship Evidence Validation",
        expected: profile.internships?.length ? "Internship claimed" : "No internship claim found",
        observed: certificate.internships?.length ? "Certificate available" : "Certificate missing",
        evidenceUsed: certificate.internships?.length ? ["Resume", "Internship Certificate"] : ["Resume"],
        confidence: internshipScore,
        reason: certificate.internships?.length
          ? "Internship certificate evidence exists."
          : "Internship claim needs supporting certificate evidence."
      })
    ];

    const overallConfidence = averageScore(checks.map((check) => check.confidence));
    const status = statusFromScore(overallConfidence);
    const academicConsistencyScore = averageScore([nameScore, cgpaScore, branchScore, yearScore]);
    const evidence = [
      makeEvidence({
        category: "Identity",
        claim: `Candidate name: ${profile.extractedName || candidate.name}`,
        evidenceUsed: checks[0].evidenceUsed,
        confidence: nameScore,
        reason: checks[0].reason
      }),
      makeEvidence({
        category: "Academic",
        claim: `CGPA ${profile.cgpa ?? "not available"}`,
        evidenceUsed: checks[1].evidenceUsed,
        confidence: cgpaScore,
        reason: checks[1].reason
      }),
      makeEvidence({
        category: "Academic",
        claim: `Branch ${profile.branch || "not available"}`,
        evidenceUsed: checks[2].evidenceUsed,
        confidence: branchScore,
        reason: checks[2].reason
      }),
      makeEvidence({
        category: "Academic",
        claim: `Passing year ${profile.passingYear || "not available"}`,
        evidenceUsed: checks[3].evidenceUsed,
        confidence: yearScore,
        reason: checks[3].reason
      }),
      makeEvidence({
        category: "Professional",
        claim: profile.internships?.length ? "Internship claimed" : "No internship claim found",
        evidenceUsed: checks[4].evidenceUsed,
        confidence: internshipScore,
        reason: checks[4].reason
      }),
      ...profile.skills.slice(0, 6).map((skill) =>
        makeEvidence({
          category: "Skills",
          claim: `${skill} skill detected`,
          evidenceUsed: ["Resume", ...(profile.projects?.length ? ["Projects"] : [])],
          confidence: 88,
          reason: "Skill appears in extracted resume or project evidence."
        })
      )
    ];
    const issues = checks
      .filter((check) => check.confidence < 95)
      .map((check) => `${check.label}: ${check.outcome}`);

    return {
      profile: {
        ...profile,
        academicConsistency: {
          score: academicConsistencyScore,
          status: confidenceLabel(academicConsistencyScore),
          summary: `Academic evidence is ${confidenceLabel(academicConsistencyScore).toLowerCase()} at ${academicConsistencyScore}% confidence.`
        },
        evidence,
        lifecycleStage: "Verification Engine Completed",
        verificationStatus: status,
        issues,
        lastVerificationRun: new Date()
      },
      record: {
        candidate: candidate._id?.toString?.() || candidate._id,
        status,
        overallConfidence,
        checks,
        evidence,
        issues
      }
    };
  },
  async saveRecord(record) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.saveVerification(record);
    return VerificationRecord.create(record);
  },
  async getLatest(candidateId) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.getLatestVerification(candidateId);
    if (!isValidMongoObjectId(candidateId)) return null;
    return VerificationRecord.findOne({ candidate: candidateId }).sort({ generatedAt: -1 }).lean();
  },
  async saveSummary(summary) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.saveSummary(summary);
    return CredentialSummary.findOneAndUpdate({ candidate: summary.candidate }, summary, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  },
  async getSummary(candidateId) {
    if (!isMongoEnabled || env.nodeEnv !== "production") return demoStore.getSummary(candidateId);
    if (!isValidMongoObjectId(candidateId)) return null;
    return CredentialSummary.findOne({ candidate: candidateId }).sort({ generatedAt: -1 }).lean();
  },
  rankStatus(status) {
    return {
      [VERIFICATION_STATUS.VERIFIED]: 4,
      [VERIFICATION_STATUS.MINOR_DIFFERENCES]: 3,
      [VERIFICATION_STATUS.NEEDS_REVIEW]: 2,
      [VERIFICATION_STATUS.HIGH_RISK]: 1
    }[status] || 0;
  }
};
