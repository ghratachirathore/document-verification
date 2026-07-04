import { Check, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, unwrap } from "../api/http";
import { DataTable } from "../components/DataTable.jsx";
import { EvidencePanel } from "../components/EvidencePanel.jsx";
import { InsightCard } from "../components/InsightCard.jsx";
import { LifecycleTimeline } from "../components/LifecycleTimeline.jsx";
import { ErrorState, LoadingState } from "../components/PageState.jsx";
import { ProfileSignalGrid } from "../components/ProfileSignalGrid.jsx";
import { Section } from "../components/Section.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { VerificationReport } from "../components/VerificationReport.jsx";
import { formatDate } from "../utils/format";

export const CandidateDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("Please clarify the highlighted credential inconsistency.");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(unwrap(await api.get(`/hr/candidates/${id}`)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidate workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const act = async (action) => {
    if (["approve", "reject"].includes(action)) {
      const confirmed = window.confirm(`Confirm ${action === "approve" ? "approval" : "rejection"} for ${data?.candidate?.name}?`);
      if (!confirmed) return;
    }
    setSaving(true);
    setActionError("");
    try {
      await api.patch(`/hr/candidates/${id}/action`, { action, message });
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Recruiter action failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState title="Loading recruiter workspace" message="Fetching candidate profile, evidence, and decision history." />;
  if (error) return <ErrorState title="Candidate workspace unavailable" message={error} onRetry={load} />;

  const { candidate, documents, verification, summary } = data;
  const profile = candidate.candidateProfile || {};

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Candidate Review Workspace</p>
          <h1>{candidate.name}</h1>
          <span>
            {candidate.email} · {profile.lifecycleStage || "Profile Created"}
          </span>
        </div>
        <div className="action-cluster">
          <StatusBadge status={profile.verificationStatus} />
          <StatusBadge status={profile.hrDecision} />
        </div>
      </header>

      <Section
        title="Recruiter Actions"
        action={
          <div className="action-cluster">
            <button className="icon-text-button success" disabled={saving} onClick={() => act("approve")} type="button">
              <Check size={16} /> Approve
            </button>
            <button className="icon-text-button danger" disabled={saving} onClick={() => act("reject")} type="button">
              <X size={16} /> Reject
            </button>
            <button className="icon-text-button solid" disabled={saving} onClick={() => act("request_clarification")} type="button">
              <MessageSquare size={16} /> Request Clarification
            </button>
          </div>
        }
      >
        {actionError ? <div className="form-error">{actionError}</div> : null}
        <label>
          Decision note
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} />
        </label>
      </Section>

      <Section title="Candidate Overview">
        <div className="metric-grid four">
          <InsightCard label="Overall Confidence" value={`${verification?.overallConfidence || 0}%`} detail="Backend verification confidence" />
          <InsightCard label="Verification Status" value={profile.verificationStatus || "Pending"} detail="AI does not decide this" />
          <InsightCard label="Lifecycle Stage" value={profile.lifecycleStage || "Profile Created"} detail="Current workflow stage" />
          <InsightCard label="Last Updated" value={formatDate(profile.lastUpdated)} detail="Most recent activity" />
        </div>
      </Section>

      <div className="two-column">
        <Section title="Academic Profile">
          <ProfileSignalGrid
            items={[
              { label: "Degree", value: profile.degree || "Not extracted" },
              { label: "Branch", value: profile.branch || "Not extracted" },
              { label: "CGPA", value: profile.cgpa || "Not extracted" },
              { label: "Passing Year", value: profile.passingYear || "Not extracted" },
              { label: "Academic Consistency", value: `${profile.academicConsistency?.score || 0}%`, detail: profile.academicConsistency?.summary }
            ]}
          />
        </Section>

        <Section title="Professional Profile">
          <div className="profile-workspace compact">
            <div>
              <h3>Skills</h3>
              <div className="chip-row compact">{profile.skills?.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </div>
            <div>
              <h3>Technical Strengths</h3>
              <div className="issue-list success-list">{profile.technicalStrengths?.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div>
              <h3>Career Highlights</h3>
              <div className="issue-list neutral-list">{profile.careerHighlights?.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Verification Report">
        <VerificationReport checks={verification?.checks || []} />
      </Section>

      <Section title="Evidence Panel">
        <EvidencePanel evidence={verification?.evidence || profile.evidence || []} />
      </Section>

      <Section title="AI Insights">
        <div className="ai-insight-grid">
          <article className="summary-text">
            <strong>AI Candidate Summary</strong>
            <p>{summary?.summary}</p>
          </article>
          <div className="issue-list success-list">{summary?.strengths?.map((item) => <span key={item}>{item}</span>)}</div>
          <div className="issue-list">{summary?.risks?.map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </Section>

      <Section title="Projects & Internships">
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
            { key: "company", label: "Company" },
            { key: "role", label: "Role" },
            { key: "duration", label: "Duration" },
            { key: "hasProof", label: "Proof", render: (row) => <StatusBadge status={row.hasProof ? "Verified" : "Evidence Missing"} /> }
          ]}
          rows={profile.internships || []}
        />
      </Section>

      <Section title="Uploaded Documents">
        <DataTable
          columns={[
            { key: "type", label: "Type" },
            { key: "originalName", label: "File" },
            { key: "storageProvider", label: "Storage" },
            { key: "uploadedAt", label: "Uploaded", render: (row) => formatDate(row.uploadedAt) }
          ]}
          rows={documents}
        />
      </Section>

      <div className="two-column">
        <Section title="Verification Timeline">
          <LifecycleTimeline items={profile.timeline || []} />
        </Section>

        <Section title="HR Decision History">
          <div className="timeline">
            {(profile.decisionHistory || []).length ? (
              profile.decisionHistory.map((item, index) => (
                <div key={`${item.action}-${index}`}>
                  <strong>{item.action}</strong>
                  <p>{item.detail}</p>
                  <span>
                    {item.actor || "HR"} · {formatDate(item.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="muted">No HR decision has been recorded yet.</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
