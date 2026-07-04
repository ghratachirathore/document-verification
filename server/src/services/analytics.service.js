import { HR_DECISIONS, VERIFICATION_STATUS } from "../constants/status.constants.js";

const countBy = (items, getter) =>
  items.reduce((acc, item) => {
    const key = getter(item) || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const isToday = (value) => {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
};

const candidateConfidence = (candidate) => {
  const evidence = candidate.candidateProfile?.evidence || [];
  if (!evidence.length) return 0;
  return Math.round(evidence.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / evidence.length);
};

const topSkills = (candidates, limit = 8) => {
  const counts = {};
  candidates.forEach((candidate) => {
    candidate.candidateProfile?.skills?.forEach((skill) => {
      counts[skill] = (counts[skill] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([skill, count]) => ({ skill, count, query: `skill=${encodeURIComponent(skill)}` }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const candidatePreview = (candidate) => ({
  id: candidate._id,
  name: candidate.name,
  branch: candidate.candidateProfile?.branch,
  status: candidate.candidateProfile?.verificationStatus,
  confidence: candidateConfidence(candidate),
  reason: candidate.candidateProfile?.issues?.[0] || "No blocking issue",
  pendingAction:
    candidate.candidateProfile?.hrDecision === HR_DECISIONS.CLARIFICATION_REQUESTED
      ? "Waiting for candidate clarification"
      : candidate.candidateProfile?.verificationStatus === VERIFICATION_STATUS.HIGH_RISK
        ? "Escalate before approval"
        : candidate.candidateProfile?.verificationStatus === VERIFICATION_STATUS.NEEDS_REVIEW
          ? "Inspect evidence"
          : "Review candidate"
});

export const analyticsService = {
  build(candidates) {
    const profiles = candidates.map((candidate) => candidate.candidateProfile || {});
    const totalCandidates = candidates.length;
    const statusCounts = countBy(candidates, (candidate) => candidate.candidateProfile?.verificationStatus);
    const uploadedTodayCandidates = candidates.filter((candidate) => isToday(candidate.candidateProfile?.lastUpdated || candidate.updatedAt));
    const awaitingReviewCandidates = candidates.filter((candidate) => candidate.candidateProfile?.hrDecision === HR_DECISIONS.PENDING);
    const pendingClarifications = candidates.filter((candidate) =>
      candidate.candidateProfile?.clarifications?.some((clarification) => clarification.status === "open")
    );
    const verifiedToday = candidates.filter(
      (candidate) =>
        candidate.candidateProfile?.verificationStatus === VERIFICATION_STATUS.VERIFIED &&
        isToday(candidate.candidateProfile?.lastVerificationRun)
    );
    const cgpas = profiles.map((profile) => Number(profile.cgpa)).filter(Number.isFinite);
    const averageCgpa = cgpas.length ? Number((cgpas.reduce((sum, value) => sum + value, 0) / cgpas.length).toFixed(2)) : 0;
    const branches = Object.entries(countBy(candidates, (candidate) => candidate.candidateProfile?.branch))
      .map(([branch, count]) => ({ branch, count, query: `branch=${encodeURIComponent(branch)}` }))
      .sort((a, b) => b.count - a.count);
    const skills = topSkills(candidates);
    const missingInternshipProof = candidates.filter((candidate) =>
      candidate.candidateProfile?.internships?.some((internship) => !internship.hasProof)
    );
    const verifiedInternship = candidates.filter((candidate) =>
      candidate.candidateProfile?.internships?.some((internship) => internship.hasProof)
    );

    return {
      overview: {
        totalCandidates,
        verified: statusCounts[VERIFICATION_STATUS.VERIFIED] || 0,
        minorDifferences: statusCounts[VERIFICATION_STATUS.MINOR_DIFFERENCES] || 0,
        needsReview: statusCounts[VERIFICATION_STATUS.NEEDS_REVIEW] || 0,
        highRisk: statusCounts[VERIFICATION_STATUS.HIGH_RISK] || 0,
        awaitingHrReview: awaitingReviewCandidates.length,
        uploadedToday: uploadedTodayCandidates.length,
        averageCgpa,
        topSkills: skills
      },
      hiringInsights: [
        ...skills.slice(0, 4).map((item) => ({
          label: `${item.skill} Candidates`,
          value: item.count,
          detail: "Skill-based recruiter shortlist",
          query: item.query
        })),
        {
          label: "Candidates Without Internship Proof",
          value: missingInternshipProof.length,
          detail: "Requires evidence follow-up",
          query: "internshipVerified=false"
        },
        {
          label: "Candidates With Verified Internship",
          value: verifiedInternship.length,
          detail: "Professional claim supported",
          query: "internshipVerified=true"
        },
        {
          label: "Candidates Uploaded Today",
          value: uploadedTodayCandidates.length,
          detail: "Fresh intake",
          query: "uploadedToday=true"
        },
        {
          label: "Candidates Awaiting HR Review",
          value: awaitingReviewCandidates.length,
          detail: "Ready for recruiter action",
          query: "awaitingReview=true"
        }
      ],
      reviewQueue: candidates
        .filter((candidate) =>
          [VERIFICATION_STATUS.NEEDS_REVIEW, VERIFICATION_STATUS.HIGH_RISK, VERIFICATION_STATUS.MINOR_DIFFERENCES].includes(
            candidate.candidateProfile?.verificationStatus
          )
        )
        .sort((a, b) => candidateConfidence(a) - candidateConfidence(b))
        .map(candidatePreview),
      verificationInsights: [
        VERIFICATION_STATUS.VERIFIED,
        VERIFICATION_STATUS.MINOR_DIFFERENCES,
        VERIFICATION_STATUS.NEEDS_REVIEW,
        VERIFICATION_STATUS.HIGH_RISK
      ].map((status) => ({
        status,
        count: statusCounts[status] || 0,
        query: `status=${encodeURIComponent(status)}`,
        candidates: candidates.filter((candidate) => candidate.candidateProfile?.verificationStatus === status).map(candidatePreview)
      })),
      trends: {
        verified: { value: statusCounts[VERIFICATION_STATUS.VERIFIED] || 0, delta: verifiedToday.length ? `+${verifiedToday.length} today` : "No change" },
        needsReview: { value: statusCounts[VERIFICATION_STATUS.NEEDS_REVIEW] || 0, delta: "Review load active" },
        highRisk: { value: statusCounts[VERIFICATION_STATUS.HIGH_RISK] || 0, delta: "Escalation queue" },
        recentlyVerified: candidates
          .filter((candidate) => candidate.candidateProfile?.verificationStatus === VERIFICATION_STATUS.VERIFIED)
          .slice(0, 5)
          .map(candidatePreview),
        pendingClarifications: pendingClarifications.map(candidatePreview),
        recentlyUploaded: uploadedTodayCandidates.map(candidatePreview),
        mostCommonSkills: skills,
        mostCommonBranches: branches
      },
      recentActivity: candidates
        .flatMap((candidate) =>
          (candidate.candidateProfile?.timeline || []).map((event) => ({
            candidateId: candidate._id,
            candidateName: candidate.name,
            ...event
          }))
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),
      skills: {
        topSkills: skills,
        distribution: skills.map((item) => ({ label: item.skill, value: item.count }))
      },
      academic: {
        branchDistribution: branches.map((item) => ({ label: item.branch, value: item.count, query: item.query })),
        cgpaDistribution: [
          { label: "9.0+", value: cgpas.filter((cgpa) => cgpa >= 9).length },
          { label: "8.0 - 8.9", value: cgpas.filter((cgpa) => cgpa >= 8 && cgpa < 9).length },
          { label: "7.0 - 7.9", value: cgpas.filter((cgpa) => cgpa >= 7 && cgpa < 8).length },
          { label: "Below 7", value: cgpas.filter((cgpa) => cgpa < 7).length }
        ]
      },
      verification: Object.entries(statusCounts).map(([label, value]) => ({ label, value })),
      internship: {
        withProof: verifiedInternship.length,
        missingProof: missingInternshipProof.length
      }
    };
  }
};
