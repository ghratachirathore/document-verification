import bcrypt from "bcryptjs";
import crypto from "crypto";
import { DOCUMENT_TYPES, HR_DECISIONS, USER_ROLES, VERIFICATION_STATUS } from "../constants/status.constants.js";

const createId = () => crypto.randomUUID();
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const today = new Date();
const candidatePassword = await bcrypt.hash("EduVfy-Candidate-2026!p9Q4zL2", 10);
const hrPassword = await bcrypt.hash("EduVfy-Recruiter-2026!R7mK8sT3", 10);

const matches = (value, query) => String(value || "").toLowerCase().includes(String(query || "").toLowerCase());
const riskStatusMap = {
  low: VERIFICATION_STATUS.VERIFIED,
  minor: VERIFICATION_STATUS.MINOR_DIFFERENCES,
  review: VERIFICATION_STATUS.NEEDS_REVIEW,
  high: VERIFICATION_STATUS.HIGH_RISK
};

const recommendedAction = (score) => {
  if (score >= 95) return "No action required";
  if (score >= 85) return "Review but do not block";
  if (score >= 65) return "Request clarification or inspect evidence";
  return "Escalate before approval";
};

const outcomeFromScore = (score) => {
  if (score >= 95) return "Match";
  if (score >= 85) return "Minor Difference";
  if (score >= 65) return "Needs Review";
  return "High Risk";
};

const makeCheck = ({ key, label, expected, observed, evidenceUsed, confidence, reason }) => ({
  key,
  label,
  expected,
  observed,
  evidenceUsed,
  confidence,
  outcome: outcomeFromScore(confidence),
  finalStatus: outcomeFromScore(confidence),
  reason,
  recommendedAction: recommendedAction(confidence)
});

const makeEvidence = ({ category, claim, evidenceUsed, confidence, reason }) => ({
  category,
  claim,
  evidenceUsed,
  status: outcomeFromScore(confidence),
  confidence,
  reason
});

const candidateSeeds = [
  {
    name: "Aman Sharma",
    email: "candidate@eduverify.ai",
    status: VERIFICATION_STATUS.MINOR_DIFFERENCES,
    confidence: 91,
    updatedAt: today,
    profile: {
      extractedName: "Aman K Sharma",
      degree: "Bachelor of Technology",
      branch: "Computer Science",
      cgpa: 8.4,
      passingYear: 2025,
      skills: ["React", "Node.js", "MongoDB", "Machine Learning", "Express.js"],
      projects: [
        {
          title: "Campus Placement Portal",
          description: "Built a MERN workflow for student applications and HR shortlisting.",
          technologies: ["React", "Express", "MongoDB"]
        },
        {
          title: "ML Attendance Insights",
          description: "Predicted attendance risk from semester activity patterns.",
          technologies: ["Python", "Scikit-learn"]
        }
      ],
      internships: [{ company: "TechNova Labs", role: "Full Stack Intern", duration: "May 2024 - July 2024", hasProof: true }],
      technicalStrengths: ["MERN stack exposure", "API integration", "Frontend workflow design", "MongoDB modeling"],
      careerHighlights: ["Verified full-stack internship", "Two project artifacts extracted", "Strong academic profile"],
      issues: ["Name Match: Minor Difference"],
      hrDecision: HR_DECISIONS.PENDING,
      lifecycleStage: "Awaiting HR Review",
      clarifications: []
    }
  },
  {
    name: "Neha Verma",
    email: "neha.verma@eduverify.ai",
    status: VERIFICATION_STATUS.VERIFIED,
    confidence: 97,
    updatedAt: today,
    profile: {
      extractedName: "Neha Verma",
      degree: "Bachelor of Engineering",
      branch: "Information Technology",
      cgpa: 9.1,
      passingYear: 2025,
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      projects: [
        {
          title: "Interview Scheduler",
          description: "Created recruiter scheduling workflows with role-aware dashboards.",
          technologies: ["React", "Node.js"]
        }
      ],
      internships: [{ company: "CloudCore Systems", role: "Frontend Intern", duration: "Jan 2025 - Apr 2025", hasProof: true }],
      technicalStrengths: ["Frontend architecture", "TypeScript discipline", "Recruiter workflow familiarity"],
      careerHighlights: ["High CGPA candidate", "Verified internship proof", "Strong React profile"],
      issues: [],
      hrDecision: HR_DECISIONS.APPROVED,
      lifecycleStage: "Approved",
      clarifications: []
    }
  },
  {
    name: "Rahul Iyer",
    email: "rahul.iyer@eduverify.ai",
    status: VERIFICATION_STATUS.NEEDS_REVIEW,
    confidence: 72,
    updatedAt: daysAgo(1),
    profile: {
      extractedName: "Rahul S Iyer",
      degree: "Bachelor of Technology",
      branch: "Electronics and Communication",
      cgpa: 7.6,
      passingYear: 2024,
      skills: ["Node.js", "Express.js", "MongoDB", "REST APIs"],
      projects: [
        {
          title: "IoT Device Monitor",
          description: "Built a backend service for telemetry ingestion and dashboards.",
          technologies: ["Node.js", "MongoDB"]
        }
      ],
      internships: [{ company: "SignalWorks", role: "Backend Intern", duration: "Jun 2023 - Aug 2023", hasProof: false }],
      technicalStrengths: ["Backend API exposure", "Database-backed services", "REST integration"],
      careerHighlights: ["Backend-focused profile", "Internship claim requires evidence", "Branch differs from ideal CS pool"],
      issues: ["Internship Evidence Validation: Needs Review", "Name Match: Minor Difference"],
      hrDecision: HR_DECISIONS.CLARIFICATION_REQUESTED,
      lifecycleStage: "Clarification Requested",
      clarifications: [
        {
          message: "Please upload internship certificate or offer letter for SignalWorks internship.",
          status: "open",
          createdAt: daysAgo(1)
        }
      ]
    }
  },
  {
    name: "Priya Nair",
    email: "priya.nair@eduverify.ai",
    status: VERIFICATION_STATUS.HIGH_RISK,
    confidence: 48,
    updatedAt: daysAgo(2),
    profile: {
      extractedName: "P Nair",
      degree: "Bachelor of Science",
      branch: "Computer Applications",
      cgpa: 6.8,
      passingYear: 2023,
      skills: ["React", "HTML", "CSS", "JavaScript"],
      projects: [
        {
          title: "Portfolio Builder",
          description: "Created reusable templates for student portfolio publishing.",
          technologies: ["React", "CSS"]
        }
      ],
      internships: [{ company: "BrightApps", role: "UI Intern", duration: "Apr 2023 - Jun 2023", hasProof: false }],
      technicalStrengths: ["Frontend fundamentals", "UI implementation"],
      careerHighlights: ["Frontend portfolio evidence found", "Internship proof missing", "Academic evidence inconsistent"],
      issues: ["CGPA Match: High Risk", "Internship Evidence Validation: High Risk"],
      hrDecision: HR_DECISIONS.PENDING,
      lifecycleStage: "High Risk Review",
      clarifications: []
    }
  },
  {
    name: "Karan Mehta",
    email: "karan.mehta@eduverify.ai",
    status: VERIFICATION_STATUS.VERIFIED,
    confidence: 96,
    updatedAt: daysAgo(3),
    profile: {
      extractedName: "Karan Mehta",
      degree: "Bachelor of Technology",
      branch: "Computer Science",
      cgpa: 8.9,
      passingYear: 2024,
      skills: ["Node.js", "AWS", "MongoDB", "Docker"],
      projects: [
        {
          title: "Serverless Job Board",
          description: "Implemented APIs and deployment flows for a campus hiring board.",
          technologies: ["Node.js", "AWS", "MongoDB"]
        }
      ],
      internships: [{ company: "HiringStack", role: "Platform Intern", duration: "Feb 2024 - May 2024", hasProof: true }],
      technicalStrengths: ["Backend platform work", "Cloud deployment", "Database modeling"],
      careerHighlights: ["Verified internship", "Strong backend profile", "Production deployment exposure"],
      issues: [],
      hrDecision: HR_DECISIONS.PENDING,
      lifecycleStage: "Awaiting HR Review",
      clarifications: []
    }
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@eduverify.ai",
    status: VERIFICATION_STATUS.MINOR_DIFFERENCES,
    confidence: 88,
    updatedAt: today,
    profile: {
      extractedName: "Sneha S Kulkarni",
      degree: "Bachelor of Engineering",
      branch: "Electronics",
      cgpa: 8.2,
      passingYear: 2025,
      skills: ["Python", "React", "Data Visualization", "SQL"],
      projects: [
        {
          title: "Placement Analytics Board",
          description: "Created dashboards for department-level hiring readiness and student skill clusters.",
          technologies: ["React", "Python", "SQL"]
        }
      ],
      internships: [{ company: "InsightGrid", role: "Data Analyst Intern", duration: "Aug 2024 - Oct 2024", hasProof: true }],
      technicalStrengths: ["Analytical dashboards", "Frontend reporting", "SQL-backed insights"],
      careerHighlights: ["Verified analytics internship", "Strong academic consistency", "Cross-functional project work"],
      issues: ["Name Match: Minor Difference"],
      hrDecision: HR_DECISIONS.PENDING,
      lifecycleStage: "Awaiting HR Review",
      clarifications: []
    }
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@eduverify.ai",
    status: VERIFICATION_STATUS.NEEDS_REVIEW,
    confidence: 69,
    updatedAt: daysAgo(1),
    profile: {
      extractedName: "Vikram Singh",
      degree: "Bachelor of Technology",
      branch: "Mechanical",
      cgpa: 7.4,
      passingYear: 2024,
      skills: ["JavaScript", "Node.js", "CAD", "Project Management"],
      projects: [
        {
          title: "Maintenance Ticketing System",
          description: "Built a lightweight issue tracker for lab equipment service requests.",
          technologies: ["Node.js", "Express", "MongoDB"]
        }
      ],
      internships: [{ company: "MechWorks India", role: "Operations Intern", duration: "Jun 2023 - Jul 2023", hasProof: false }],
      technicalStrengths: ["Operational systems", "Backend foundations", "Domain process mapping"],
      careerHighlights: ["Interdisciplinary profile", "Backend project evidence found", "Internship proof missing"],
      issues: ["Internship Evidence Validation: Needs Review"],
      hrDecision: HR_DECISIONS.CLARIFICATION_REQUESTED,
      lifecycleStage: "Clarification Requested",
      clarifications: [
        {
          message: "Upload internship proof for MechWorks India or clarify the experience duration.",
          status: "open",
          createdAt: daysAgo(1)
        }
      ]
    }
  },
  {
    name: "Ananya Rao",
    email: "ananya.rao@eduverify.ai",
    status: VERIFICATION_STATUS.VERIFIED,
    confidence: 98,
    updatedAt: today,
    profile: {
      extractedName: "Ananya Rao",
      degree: "Bachelor of Technology",
      branch: "Civil",
      cgpa: 9.3,
      passingYear: 2026,
      skills: ["React", "GIS", "Python", "Data Analysis"],
      projects: [
        {
          title: "Smart Infrastructure Map",
          description: "Mapped campus infrastructure data with searchable issue overlays.",
          technologies: ["React", "Python", "GIS"]
        }
      ],
      internships: [{ company: "UrbanPlan Labs", role: "Product Intern", duration: "Dec 2025 - Feb 2026", hasProof: true }],
      technicalStrengths: ["Data-led product thinking", "React interfaces", "GIS analysis"],
      careerHighlights: ["Excellent CGPA", "Verified internship", "Strong interdisciplinary profile"],
      issues: [],
      hrDecision: HR_DECISIONS.PENDING,
      lifecycleStage: "Awaiting HR Review",
      clarifications: []
    }
  },
  {
    name: "Mohit Bansal",
    email: "mohit.bansal@eduverify.ai",
    status: VERIFICATION_STATUS.HIGH_RISK,
    confidence: 41,
    updatedAt: daysAgo(4),
    profile: {
      extractedName: "Mohit B",
      degree: "Bachelor of Engineering",
      branch: "Information Technology",
      cgpa: 7.1,
      passingYear: 2024,
      skills: ["Java", "Spring Boot", "MySQL", "React"],
      projects: [
        {
          title: "Claims Processing API",
          description: "Implemented backend workflows for eligibility checks and audit logs.",
          technologies: ["Java", "Spring Boot", "MySQL"]
        }
      ],
      internships: [{ company: "FinEdge Solutions", role: "Backend Intern", duration: "Jan 2024 - Mar 2024", hasProof: false }],
      technicalStrengths: ["Java backend exposure", "Relational data modeling"],
      careerHighlights: ["Backend project extracted", "CGPA conflict detected", "Internship proof missing"],
      issues: ["CGPA Match: High Risk", "Name Match: High Risk", "Internship Evidence Validation: High Risk"],
      hrDecision: HR_DECISIONS.REJECTED,
      lifecycleStage: "Rejected",
      clarifications: []
    }
  },
  {
    name: "Fatima Khan",
    email: "fatima.khan@eduverify.ai",
    status: VERIFICATION_STATUS.VERIFIED,
    confidence: 95,
    updatedAt: daysAgo(2),
    profile: {
      extractedName: "Fatima Khan",
      degree: "Bachelor of Technology",
      branch: "Computer Science",
      cgpa: 8.7,
      passingYear: 2025,
      skills: ["React", "Node.js", "REST APIs", "MongoDB"],
      projects: [
        {
          title: "Recruiter Notes Workspace",
          description: "Designed a role-aware note-taking surface for interview panels.",
          technologies: ["React", "Node.js", "MongoDB"]
        }
      ],
      internships: [{ company: "PeopleOps Cloud", role: "Software Intern", duration: "May 2024 - Aug 2024", hasProof: true }],
      technicalStrengths: ["Full-stack delivery", "Role-aware UX", "API design"],
      careerHighlights: ["Verified internship", "Strong recruiter-tech project", "Consistent academic evidence"],
      issues: [],
      hrDecision: HR_DECISIONS.APPROVED,
      lifecycleStage: "Approved",
      clarifications: []
    }
  }
];

const makeTimeline = (seed) => [
  { label: "Resume Uploaded", detail: "Resume evidence was added to the candidate profile.", actor: "Candidate", status: "completed", createdAt: seed.updatedAt },
  { label: "Marksheet Uploaded", detail: "Academic evidence was added for verification.", actor: "Candidate", status: "completed", createdAt: seed.updatedAt },
  {
    label: seed.profile.internships.some((item) => item.hasProof) ? "Internship Certificate Uploaded" : "Internship Evidence Missing",
    detail: seed.profile.internships.some((item) => item.hasProof)
      ? "Professional experience proof was found."
      : "Internship proof is still required.",
    actor: "System",
    status: seed.profile.internships.some((item) => item.hasProof) ? "completed" : "blocked",
    createdAt: seed.updatedAt
  },
  { label: "AI Extraction Completed", detail: "Gemini extracted structured candidate intelligence.", actor: "System", status: "completed", createdAt: seed.updatedAt },
  {
    label: "Verification Engine Completed",
    detail: `Backend checks completed at ${seed.confidence}% confidence.`,
    actor: "System",
    status: "completed",
    createdAt: seed.updatedAt
  },
  {
    label: seed.profile.lifecycleStage,
    detail: `Candidate is currently in ${seed.profile.lifecycleStage}.`,
    actor: seed.profile.lifecycleStage.includes("Approved") ? "HR" : "System",
    status: seed.profile.lifecycleStage.includes("Approved") ? "completed" : "current",
    createdAt: seed.updatedAt
  }
];

const makeProfile = (seed) => ({
  ...seed.profile,
  profileCompletion: seed.profile.internships.some((item) => item.hasProof) ? 96 : 82,
  verificationStatus: seed.status,
  academicConsistency: {
    score: seed.status === VERIFICATION_STATUS.HIGH_RISK ? 58 : seed.status === VERIFICATION_STATUS.NEEDS_REVIEW ? 76 : 96,
    status: seed.status === VERIFICATION_STATUS.HIGH_RISK ? "High Risk" : seed.status === VERIFICATION_STATUS.NEEDS_REVIEW ? "Needs Review" : "Match",
    summary: seed.status === VERIFICATION_STATUS.HIGH_RISK ? "Academic records require HR inspection." : "Academic evidence is mostly consistent."
  },
  evidence: makeEvidenceSet(seed),
  timeline: makeTimeline(seed),
  decisionHistory:
    seed.profile.hrDecision === HR_DECISIONS.APPROVED
      ? [{ action: HR_DECISIONS.APPROVED, detail: "Candidate approved after verification review.", actor: "HR", createdAt: seed.updatedAt }]
      : seed.profile.hrDecision === HR_DECISIONS.CLARIFICATION_REQUESTED
        ? [{ action: HR_DECISIONS.CLARIFICATION_REQUESTED, detail: seed.profile.clarifications[0]?.message, actor: "HR", createdAt: seed.updatedAt }]
        : [],
  lastVerificationRun: seed.updatedAt,
  lastUpdated: seed.updatedAt
});

function makeEvidenceSet(seed) {
  const internshipHasProof = seed.profile.internships.some((item) => item.hasProof);
  const academicConfidence = seed.status === VERIFICATION_STATUS.HIGH_RISK ? 48 : seed.status === VERIFICATION_STATUS.NEEDS_REVIEW ? 76 : 96;
  return [
    makeEvidence({
      category: "Identity",
      claim: `Candidate name: ${seed.profile.extractedName}`,
      evidenceUsed: ["Resume", "Marksheet"],
      confidence: seed.status === VERIFICATION_STATUS.MINOR_DIFFERENCES ? 91 : academicConfidence,
      reason: seed.status === VERIFICATION_STATUS.MINOR_DIFFERENCES ? "Middle initial differs across academic evidence." : "Name evidence is aligned."
    }),
    makeEvidence({
      category: "Academic",
      claim: `CGPA ${seed.profile.cgpa}`,
      evidenceUsed: ["Marksheet"],
      confidence: seed.status === VERIFICATION_STATUS.HIGH_RISK ? 42 : 100,
      reason: seed.status === VERIFICATION_STATUS.HIGH_RISK ? "CGPA claim conflicts with extracted academic record." : "CGPA is supported by marksheet evidence."
    }),
    makeEvidence({
      category: "Academic",
      claim: `Branch ${seed.profile.branch}`,
      evidenceUsed: ["Resume", "Marksheet"],
      confidence: seed.status === VERIFICATION_STATUS.HIGH_RISK ? 64 : 96,
      reason: "Branch is compared across candidate profile and academic evidence."
    }),
    makeEvidence({
      category: "Academic",
      claim: `Passing year ${seed.profile.passingYear}`,
      evidenceUsed: ["Marksheet"],
      confidence: academicConfidence,
      reason: "Passing year is verified from academic evidence."
    }),
    makeEvidence({
      category: "Professional",
      claim: seed.profile.internships[0]?.company ? `Internship at ${seed.profile.internships[0].company}` : "No internship claim",
      evidenceUsed: internshipHasProof ? ["Resume", "Internship Certificate"] : ["Resume"],
      confidence: internshipHasProof ? 95 : seed.status === VERIFICATION_STATUS.HIGH_RISK ? 38 : 62,
      reason: internshipHasProof ? "Internship certificate supports the resume claim." : "Candidate mentions internship but proof is missing."
    }),
    ...seed.profile.skills.slice(0, 3).map((skill) =>
      makeEvidence({
        category: "Skills",
        claim: `${skill} skill detected`,
        evidenceUsed: ["Resume", "Projects"],
        confidence: 88,
        reason: "Skill appears in resume or project evidence."
      })
    )
  ];
}

const users = [
  ...candidateSeeds.map((seed) => ({
    _id: createId(),
    name: seed.name,
    email: seed.email,
    password: candidatePassword,
    role: USER_ROLES.CANDIDATE,
    createdAt: seed.updatedAt,
    updatedAt: seed.updatedAt,
    candidateProfile: makeProfile(seed)
  })),
  {
    _id: createId(),
    name: "Priya Menon",
    email: "hr@eduverify.ai",
    password: hrPassword,
    role: USER_ROLES.HR,
    createdAt: today,
    updatedAt: today
  }
];

const documents = users
  .filter((user) => user.role === USER_ROLES.CANDIDATE)
  .flatMap((candidate) => {
    const profile = candidate.candidateProfile;
    const base = [
      {
        _id: createId(),
        candidate: candidate._id,
        type: DOCUMENT_TYPES.RESUME,
        originalName: `${candidate.name.toLowerCase().replace(/\s+/g, "-")}-resume.pdf`,
        mimeType: "application/pdf",
        size: 420000,
        url: `demo://eduverify/${candidate._id}/resume`,
        storageProvider: "demo",
        extractedData: {
          name: candidate.name,
          degree: profile.degree,
          branch: profile.branch,
          cgpa: profile.cgpa,
          passingYear: profile.passingYear,
          skills: profile.skills,
          projects: profile.projects,
          internships: profile.internships
        },
        uploadedAt: profile.lastUpdated
      },
      {
        _id: createId(),
        candidate: candidate._id,
        type: DOCUMENT_TYPES.MARKSHEET,
        originalName: `${candidate.name.toLowerCase().replace(/\s+/g, "-")}-marksheet.pdf`,
        mimeType: "application/pdf",
        size: 315000,
        url: `demo://eduverify/${candidate._id}/marksheet`,
        storageProvider: "demo",
        extractedData: {
          name: profile.extractedName,
          degree: profile.degree,
          branch: profile.branch,
          cgpa: profile.cgpa,
          passingYear: profile.passingYear
        },
        uploadedAt: profile.lastUpdated
      }
    ];
    if (profile.internships.some((item) => item.hasProof)) {
      base.push({
        _id: createId(),
        candidate: candidate._id,
        type: DOCUMENT_TYPES.INTERNSHIP_CERTIFICATE,
        originalName: `${candidate.name.toLowerCase().replace(/\s+/g, "-")}-internship.pdf`,
        mimeType: "application/pdf",
        size: 290000,
        url: `demo://eduverify/${candidate._id}/internship`,
        storageProvider: "demo",
        extractedData: { name: candidate.name, internships: profile.internships },
        uploadedAt: profile.lastUpdated
      });
    }
    return base;
  });

const verificationRecords = users
  .filter((user) => user.role === USER_ROLES.CANDIDATE)
  .map((candidate) => {
    const profile = candidate.candidateProfile;
    const evidence = profile.evidence;
    const checks = [
      makeCheck({
        key: "name",
        label: "Name Match",
        expected: candidate.name,
        observed: profile.extractedName,
        evidenceUsed: ["Resume", "Marksheet"],
        confidence: evidence[0].confidence,
        reason: evidence[0].reason
      }),
      makeCheck({
        key: "cgpa",
        label: "CGPA Match",
        expected: profile.cgpa,
        observed: profile.cgpa,
        evidenceUsed: ["Marksheet"],
        confidence: evidence[1].confidence,
        reason: evidence[1].reason
      }),
      makeCheck({
        key: "branch",
        label: "Branch Match",
        expected: profile.branch,
        observed: profile.branch,
        evidenceUsed: ["Resume", "Marksheet"],
        confidence: evidence[2].confidence,
        reason: evidence[2].reason
      }),
      makeCheck({
        key: "passingYear",
        label: "Passing Year Match",
        expected: profile.passingYear,
        observed: profile.passingYear,
        evidenceUsed: ["Marksheet"],
        confidence: evidence[3].confidence,
        reason: evidence[3].reason
      }),
      makeCheck({
        key: "internship",
        label: "Internship Evidence Validation",
        expected: "Internship claim",
        observed: profile.internships.some((item) => item.hasProof) ? "Certificate found" : "Certificate missing",
        evidenceUsed: evidence[4].evidenceUsed,
        confidence: evidence[4].confidence,
        reason: evidence[4].reason
      })
    ];
    return {
      _id: createId(),
      candidate: candidate._id,
      status: profile.verificationStatus,
      overallConfidence: candidateSeeds.find((seed) => seed.email === candidate.email)?.confidence || 80,
      checks,
      evidence,
      issues: profile.issues,
      generatedAt: profile.lastVerificationRun
    };
  });

const credentialSummaries = users
  .filter((user) => user.role === USER_ROLES.CANDIDATE)
  .map((candidate) => ({
    _id: createId(),
    candidate: candidate._id,
    summary: `${candidate.name} presents a ${candidate.candidateProfile.branch} profile with ${candidate.candidateProfile.skills.slice(0, 3).join(", ")} experience. Current verification state is ${candidate.candidateProfile.verificationStatus}.`,
    strengths: candidate.candidateProfile.technicalStrengths,
    risks: candidate.candidateProfile.issues.length ? candidate.candidateProfile.issues : ["No major credential risk detected"],
    generatedBy: "demo",
    generatedAt: candidate.candidateProfile.lastVerificationRun
  }));

const toPublicUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const isToday = (value) => {
  const date = new Date(value);
  return date.toDateString() === new Date().toDateString();
};

export const demoStore = {
  isDemo: true,
  async createUser(payload) {
    const exists = users.some((user) => user.email === payload.email.toLowerCase());
    if (exists) return null;

    const user = {
      _id: createId(),
      ...payload,
      email: payload.email.toLowerCase(),
      password: await bcrypt.hash(payload.password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
      candidateProfile:
        payload.role === USER_ROLES.CANDIDATE
          ? {
              degree: "Not extracted",
              profileCompletion: 20,
              lifecycleStage: "Profile Created",
              verificationStatus: VERIFICATION_STATUS.NEEDS_REVIEW,
              hrDecision: HR_DECISIONS.PENDING,
              skills: [],
              projects: [],
              internships: [],
              technicalStrengths: [],
              careerHighlights: [],
              evidence: [],
              issues: ["Upload required documents to begin verification"],
              timeline: [{ label: "Profile created", detail: "Candidate account was created.", actor: "Candidate", status: "completed", createdAt: new Date() }],
              clarifications: [],
              decisionHistory: [],
              lastUpdated: new Date()
            }
          : undefined
    };
    users.push(user);
    return toPublicUser(user);
  },
  async findUserByEmail(email, includePassword = false) {
    const user = users.find((item) => item.email === email.toLowerCase());
    if (!user) return null;
    return includePassword ? user : toPublicUser(user);
  },
  async findUserById(id) {
    return toPublicUser(users.find((user) => user._id === id));
  },
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },
  async upsertDocument(document) {
    const index = documents.findIndex((item) => item.candidate === document.candidate && item.type === document.type);
    const nextDocument = { _id: index >= 0 ? documents[index]._id : createId(), ...document, uploadedAt: new Date(), updatedAt: new Date() };
    if (index >= 0) documents[index] = nextDocument;
    else documents.push(nextDocument);
    return nextDocument;
  },
  async getDocumentsByCandidate(candidateIdValue) {
    return documents.filter((document) => document.candidate === candidateIdValue);
  },
  async replaceDocument(documentId, candidateIdValue, update) {
    const index = documents.findIndex((document) => document._id === documentId && document.candidate === candidateIdValue);
    if (index < 0) return null;
    documents[index] = { ...documents[index], ...update, uploadedAt: new Date(), updatedAt: new Date() };
    return documents[index];
  },
  async updateCandidateProfile(candidateIdValue, profile) {
    const index = users.findIndex((user) => user._id === candidateIdValue);
    if (index < 0) return null;
    users[index].candidateProfile = { ...users[index].candidateProfile, ...profile, lastUpdated: new Date() };
    users[index].updatedAt = new Date();
    return toPublicUser(users[index]);
  },
  async saveVerification(record) {
    const nextRecord = { _id: createId(), ...record, generatedAt: new Date() };
    verificationRecords.unshift(nextRecord);
    return nextRecord;
  },
  async getLatestVerification(candidateIdValue) {
    return verificationRecords.find((record) => record.candidate === candidateIdValue) || null;
  },
  async saveSummary(summary) {
    const index = credentialSummaries.findIndex((item) => item.candidate === summary.candidate);
    const nextSummary = { _id: index >= 0 ? credentialSummaries[index]._id : createId(), ...summary, generatedAt: new Date() };
    if (index >= 0) credentialSummaries[index] = nextSummary;
    else credentialSummaries.push(nextSummary);
    return nextSummary;
  },
  async getSummary(candidateIdValue) {
    return credentialSummaries.find((summary) => summary.candidate === candidateIdValue) || null;
  },
  async listCandidates(filters = {}) {
    return users
      .filter((user) => user.role === USER_ROLES.CANDIDATE)
      .filter((candidate) => {
        const profile = candidate.candidateProfile || {};
        if (filters.status && profile.verificationStatus !== filters.status) return false;
        if (filters.riskLevel && riskStatusMap[filters.riskLevel] && profile.verificationStatus !== riskStatusMap[filters.riskLevel]) return false;
        if (filters.branch && !matches(profile.branch, filters.branch)) return false;
        if (filters.degree && !matches(profile.degree, filters.degree)) return false;
        if (filters.skill && !profile.skills?.some((skill) => matches(skill, filters.skill))) return false;
        if (filters.minCgpa && Number(profile.cgpa || 0) < Number(filters.minCgpa)) return false;
        if (filters.maxCgpa && Number(profile.cgpa || 0) > Number(filters.maxCgpa)) return false;
        if (filters.internshipVerified === "true" && !profile.internships?.some((item) => item.hasProof)) return false;
        if (filters.internshipVerified === "false" && profile.internships?.some((item) => item.hasProof)) return false;
        if (filters.uploadedToday === "true" && !isToday(profile.lastUpdated || candidate.updatedAt)) return false;
        if (filters.awaitingReview === "true" && profile.hrDecision !== HR_DECISIONS.PENDING) return false;
        if (filters.clarificationPending === "true" && !profile.clarifications?.some((item) => item.status === "open")) return false;
        if (filters.search) {
          const haystack = [
            candidate.name,
            profile.extractedName,
            profile.degree,
            profile.branch,
            profile.verificationStatus,
            profile.hrDecision,
            ...(profile.issues || []),
            ...(profile.skills || [])
          ].join(" ");
          if (!matches(haystack, filters.search)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.candidateProfile?.lastUpdated || b.updatedAt) - new Date(a.candidateProfile?.lastUpdated || a.updatedAt))
      .map(toPublicUser);
  },
  async addTimeline(candidateIdValue, label, detail) {
    const candidate = users.find((user) => user._id === candidateIdValue);
    if (!candidate?.candidateProfile) return null;
    candidate.candidateProfile.timeline.unshift({ label, detail, actor: "System", status: "completed", createdAt: new Date() });
    candidate.candidateProfile.lastUpdated = new Date();
    return toPublicUser(candidate);
  },
  async addClarification(candidateIdValue, message) {
    const candidate = users.find((user) => user._id === candidateIdValue);
    if (!candidate?.candidateProfile) return null;
    candidate.candidateProfile.clarifications.unshift({ message, status: "open", createdAt: new Date() });
    candidate.candidateProfile.hrDecision = HR_DECISIONS.CLARIFICATION_REQUESTED;
    candidate.candidateProfile.lifecycleStage = "Clarification Requested";
    candidate.candidateProfile.timeline.unshift({ label: "Clarification requested", detail: message, actor: "HR", status: "current", createdAt: new Date() });
    candidate.candidateProfile.decisionHistory.unshift({ action: HR_DECISIONS.CLARIFICATION_REQUESTED, detail: message, actor: "HR", createdAt: new Date() });
    candidate.candidateProfile.lastUpdated = new Date();
    return toPublicUser(candidate);
  },
  async updateHrDecision(candidateIdValue, decision) {
    const candidate = users.find((user) => user._id === candidateIdValue);
    if (!candidate?.candidateProfile) return null;
    candidate.candidateProfile.hrDecision = decision;
    candidate.candidateProfile.lifecycleStage = decision === HR_DECISIONS.APPROVED ? "Approved" : "Rejected";
    const detail = `Candidate lifecycle moved to ${decision}.`;
    candidate.candidateProfile.timeline.unshift({ label: `HR ${decision.replace("_", " ")}`, detail, actor: "HR", status: "completed", createdAt: new Date() });
    candidate.candidateProfile.decisionHistory.unshift({ action: decision, detail, actor: "HR", createdAt: new Date() });
    candidate.candidateProfile.lastUpdated = new Date();
    return toPublicUser(candidate);
  }
};
