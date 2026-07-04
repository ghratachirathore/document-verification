import { useMemo, useState } from "react";
import { api, unwrap } from "../api/http";
import { ActionCenter } from "../components/ActionCenter.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { EvidencePanel } from "../components/EvidencePanel.jsx";
import { InsightCard } from "../components/InsightCard.jsx";
import { LifecycleTimeline } from "../components/LifecycleTimeline.jsx";
import { ProfileSignalGrid } from "../components/ProfileSignalGrid.jsx";
import { Section } from "../components/Section.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { VerificationReport } from "../components/VerificationReport.jsx";
import { ErrorState, LoadingState } from "../components/PageState.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { formatDate } from "../utils/format";

const documentTypes = [
  { value: "resume", label: "Resume" },
  { value: "marksheet", label: "Marksheet" },
  { value: "internshipCertificate", label: "Internship Certificate" }
];

const viewCopy = {
  overview: {
    eyebrow: "Candidate workspace",
    title: "Credential review status",
    description: "Track profile readiness, evidence coverage, and recruiter requests in one place."
  },
  evidence: {
    eyebrow: "Evidence",
    title: "Claims and supporting documents",
    description: "See which academic and professional claims are backed by uploaded files."
  },
  documents: {
    eyebrow: "Documents",
    title: "Upload and replace evidence",
    description: "Manage resume, marksheet, and internship proof for the verification workflow."
  },
  timeline: {
    eyebrow: "Timeline",
    title: "Verification journey",
    description: "Follow each lifecycle event from upload through recruiter decision."
  },
  clarifications: {
    eyebrow: "Clarifications",
    title: "Recruiter requests",
    description: "Review open requests and upload the required supporting evidence."
  }
};

export const CandidateDashboard = ({ view = "overview" }) => {
  const [documentType, setDocumentType] = useState("resume");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const { data, loading, error, reload } = useAsyncData(async () => unwrap(await api.get("/candidates/me")), []);

  const candidate = data?.candidate;
  const profile = candidate?.candidateProfile || {};
  const verification = data?.verification;
  const summary = data?.summary;
  const documents = data?.documents || [];

  const documentsByType = useMemo(() => Object.fromEntries(documents.map((document) => [document.type, document])), [documents]);

  const uploadDocument = async (event) => {
    event.preventDefault();
    if (!file) return;

    const existing = documentsByType[documentType];
    const formData = new FormData();
    formData.append("type", documentType);
    formData.append("document", file);
    setUploading(true);
    setUploadError("");

    try {
      if (existing) await api.put(`/documents/${existing._id}/replace`, formData);
      else await api.post("/documents/upload", formData);
      setFile(null);
      await reload();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingState title="Preparing Candidate Intelligence Portal" message="Loading candidate profile, evidence, and verification data." />;
  if (error) return <ErrorState title="Candidate portal unavailable" message={error} onRetry={reload} />;

  const activeView = viewCopy[view] ? view : "overview";
  const copy = viewCopy[activeView];
  const showOverview = activeView === "overview";
  const showEvidence = showOverview || activeView === "evidence";
  const showDocuments = showOverview || activeView === "documents";
  const showTimeline = showOverview || activeView === "timeline";
  const showClarifications = showOverview || activeView === "clarifications";

  return (
    <div className="page-stack">
      <header className="page-header intelligence-header">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <span>
            {candidate.name} · {copy.description} Last updated {formatDate(profile.lastUpdated)}
          </span>
        </div>
        <div className="action-cluster">
          <StatusBadge status={profile.verificationStatus} />
          <StatusBadge status={profile.hrDecision} />
        </div>
      </header>

      {uploadError ? <div className="form-error">{uploadError}</div> : null}

      {showOverview ? (
        <>
          <div className="metric-grid four">
            <InsightCard label="Verification Status" value={profile.verificationStatus || "Pending"} detail="System-calculated result" />
            <InsightCard label="Lifecycle Stage" value={profile.lifecycleStage || "Profile Created"} detail="Current workflow position" />
            <InsightCard label="Profile Completion" value={`${profile.profileCompletion || 0}%`} detail="Evidence readiness" />
            <InsightCard label="Last Run" value={formatDate(profile.lastVerificationRun)} detail="Most recent check" />
          </div>

          <Section title="Academic Profile">
            <ProfileSignalGrid
              items={[
                { label: "Degree", value: profile.degree || "Not extracted" },
                { label: "Branch", value: profile.branch || "Not extracted" },
                { label: "CGPA", value: profile.cgpa || "Not extracted" },
                { label: "Passing Year", value: profile.passingYear || "Not extracted" },
                {
                  label: "Consistency",
                  value: `${profile.academicConsistency?.score || 0}%`,
                  detail: profile.academicConsistency?.summary || "Pending verification"
                },
                { label: "Status", value: profile.verificationStatus || "Pending" }
              ]}
            />
          </Section>

          <Section title="Professional Profile">
            <div className="profile-workspace">
              <div>
                <h3>Skills</h3>
                <div className="chip-row">{profile.skills?.map((skill) => <span key={skill}>{skill}</span>)}</div>
              </div>
              <div>
                <h3>Strengths</h3>
                <div className="issue-list success-list">{profile.technicalStrengths?.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
              <div>
                <h3>Highlights</h3>
                <div className="issue-list neutral-list">{profile.careerHighlights?.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            </div>
            <div className="card-grid">
              {profile.projects?.map((project) => (
                <article className="info-card" key={project.title}>
                  <strong>{project.title}</strong>
                  <p>{project.description}</p>
                  <small>{project.technologies?.join(", ")}</small>
                </article>
              ))}
            </div>
            <DataTable
              columns={[
                { key: "company", label: "Internship" },
                { key: "role", label: "Role" },
                { key: "duration", label: "Duration" },
                { key: "hasProof", label: "Evidence", render: (row) => <StatusBadge status={row.hasProof ? "Verified" : "Evidence Missing"} /> }
              ]}
              rows={profile.internships || []}
            />
          </Section>

          <Section title="Summary">
            <div className="ai-insight-grid">
              <article className="summary-text">
                <strong>Credential Summary</strong>
                <p>{summary?.summary || "Credential summary will appear after extraction."}</p>
              </article>
              <div className="issue-list success-list">{summary?.strengths?.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="issue-list">{summary?.risks?.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
          </Section>
        </>
      ) : null}

      {showEvidence ? (
        <>
          <Section title="Evidence Center">
            <EvidencePanel evidence={profile.evidence || verification?.evidence || []} />
          </Section>
          <Section title="Verification Report">
            <VerificationReport checks={verification?.checks || []} />
          </Section>
        </>
      ) : null}

      {showTimeline ? (
        <Section title="Verification Timeline">
          <LifecycleTimeline items={profile.timeline || []} />
        </Section>
      ) : null}

      {showDocuments || showClarifications ? (
        <Section title={showClarifications && !showDocuments ? "Clarification Requests" : "Action Center"}>
          <ActionCenter
            documentTypes={documentTypes}
            documentType={documentType}
            setDocumentType={setDocumentType}
            file={file}
            setFile={setFile}
            uploading={uploading}
            existingDocument={documentsByType[documentType]}
            onUpload={uploadDocument}
            clarifications={profile.clarifications || []}
          />
        </Section>
      ) : null}

      {showDocuments ? (
        <Section title="Uploaded Documents">
          <DataTable
            columns={[
              { key: "type", label: "Document Type" },
              { key: "originalName", label: "File" },
              { key: "storageProvider", label: "Storage" },
              { key: "uploadedAt", label: "Uploaded", render: (row) => formatDate(row.uploadedAt) },
              {
                key: "url",
                label: "View",
                render: (row) =>
                  row.url?.startsWith("demo://") ? (
                    <span className="muted">Demo file</span>
                  ) : (
                    <a href={row.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  )
              }
            ]}
            rows={documents}
          />
        </Section>
      ) : null}
    </div>
  );
};
