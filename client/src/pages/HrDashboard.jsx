import { BarChart3, CheckCircle2, CircleAlert, Clock3, ShieldAlert, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, unwrap } from "../api/http";
import { InsightCard } from "../components/InsightCard.jsx";
import { ReviewQueue } from "../components/ReviewQueue.jsx";
import { Section } from "../components/Section.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { ErrorState, LoadingState } from "../components/PageState.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { formatDate } from "../utils/format";

const viewCopy = {
  overview: {
    eyebrow: "Recruiter workspace",
    title: "Command Center",
    description: "Prioritize review work, inspect evidence, and move candidates toward hiring decisions."
  },
  queue: {
    eyebrow: "Review queue",
    title: "Candidates needing attention",
    description: "Inspect low-confidence checks and take the next recruiter action."
  },
  hiring: {
    eyebrow: "Hiring insights",
    title: "Actionable talent segments",
    description: "Open skill, branch, upload, and internship evidence lists from live analytics."
  },
  verification: {
    eyebrow: "Verification insights",
    title: "Credential risk overview",
    description: "Review confidence groups, reasons, and escalation signals."
  }
};

export const HrDashboard = ({ view = "overview" }) => {
  const { data: analytics, loading, error, reload } = useAsyncData(async () => unwrap(await api.get("/hr/analytics")), []);
  const navigate = useNavigate();

  if (loading) return <LoadingState title="Loading workspace" message="Preparing analytics, review queues, and hiring insights." />;
  if (error) return <ErrorState title="HR dashboard unavailable" message={error} onRetry={reload} />;

  const openQuery = (query = "") => navigate(`/hr/candidates${query ? `?${query}` : ""}`);
  const goToStatus = (status) => openQuery(`status=${encodeURIComponent(status)}`);
  const activeView = viewCopy[view] ? view : "overview";
  const copy = viewCopy[activeView];
  const showOverview = activeView === "overview";
  const showQueue = showOverview || activeView === "queue";
  const showHiring = showOverview || activeView === "hiring";
  const showVerification = showOverview || activeView === "verification";

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <span>{copy.description}</span>
        </div>
      </header>

      {showOverview ? (
        <Section title="Overview">
          <div className="metric-grid seven">
            <InsightCard label="Total Candidates" value={analytics.overview.totalCandidates} detail="Searchable database" onClick={() => openQuery()} />
            <InsightCard label="Verified" value={analytics.overview.verified} detail="Ready to progress" tone="success" onClick={() => goToStatus("Verified")} />
            <InsightCard
              label="Minor Differences"
              value={analytics.overview.minorDifferences}
              detail="Low-risk review"
              tone="info"
              onClick={() => goToStatus("Verified With Minor Differences")}
            />
            <InsightCard label="Needs Review" value={analytics.overview.needsReview} detail="Inspection needed" tone="warning" onClick={() => goToStatus("Needs Review")} />
            <InsightCard label="High Risk" value={analytics.overview.highRisk} detail="Escalate carefully" tone="danger" onClick={() => goToStatus("High Risk Inconsistency")} />
            <InsightCard label="Awaiting HR" value={analytics.overview.awaitingHrReview} detail="Pending action" onClick={() => openQuery("awaitingReview=true")} />
            <InsightCard label="Uploaded Today" value={analytics.overview.uploadedToday} detail="New intake" onClick={() => openQuery("uploadedToday=true")} />
          </div>
        </Section>
      ) : null}

      {showHiring ? (
        <Section title="Hiring Insights">
          <div className="insight-grid-cards">
            {analytics.hiringInsights.map((insight) => (
              <InsightCard key={insight.label} label={insight.label} value={insight.value} detail={insight.detail} onClick={() => openQuery(insight.query)} />
            ))}
          </div>
        </Section>
      ) : null}

      {showQueue ? (
        <Section title="Review Queue">
          <ReviewQueue rows={analytics.reviewQueue} />
        </Section>
      ) : null}

      {showVerification ? (
        <Section title="Verification Insights">
          <div className="verification-workspace">
            {analytics.verificationInsights.map((group) => (
              <article className="verification-group" key={group.status}>
                <button type="button" onClick={() => openQuery(group.query)}>
                  <div>
                    {group.status.includes("High") ? (
                      <ShieldAlert size={18} />
                    ) : group.status.includes("Review") ? (
                      <CircleAlert size={18} />
                    ) : group.status.includes("Minor") ? (
                      <Clock3 size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    <span>{group.status}</span>
                  </div>
                  <strong>{group.count}</strong>
                </button>
                <div className="verification-candidate-list">
                  {group.candidates.slice(0, 3).map((candidate) => (
                    <button key={candidate.id} type="button" onClick={() => navigate(`/hr/candidates/${candidate.id}`)}>
                      <span>{candidate.name}</span>
                      <small>{candidate.reason}</small>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {showOverview || showVerification ? (
        <div className="two-column">
          <Section title="Trends">
          <div className="trend-grid">
            <div>
              <BarChart3 size={18} />
              <span>Verified</span>
              <strong>{analytics.trends.verified.value}</strong>
              <small>{analytics.trends.verified.delta}</small>
            </div>
            <div>
              <CircleAlert size={18} />
              <span>Needs Review</span>
              <strong>{analytics.trends.needsReview.value}</strong>
              <small>{analytics.trends.needsReview.delta}</small>
            </div>
            <div>
              <ShieldAlert size={18} />
              <span>High Risk</span>
              <strong>{analytics.trends.highRisk.value}</strong>
              <small>{analytics.trends.highRisk.delta}</small>
            </div>
          </div>
          </Section>

          <Section title="Pending Clarifications">
          <div className="list-panel">
            {analytics.trends.pendingClarifications.length ? (
              analytics.trends.pendingClarifications.map((candidate) => (
                <button key={candidate.id} type="button" onClick={() => navigate(`/hr/candidates/${candidate.id}`)}>
                  <span>{candidate.name}</span>
                  <small>{candidate.reason}</small>
                  <StatusBadge status={candidate.status} />
                </button>
              ))
            ) : (
              <p className="muted">No open clarifications.</p>
            )}
          </div>
          </Section>
        </div>
      ) : null}

      {showOverview || showQueue ? (
        <div className="two-column">
          <Section title="Recently Uploaded">
          <div className="list-panel">
            {analytics.trends.recentlyUploaded.map((candidate) => (
              <button key={candidate.id} type="button" onClick={() => navigate(`/hr/candidates/${candidate.id}`)}>
                <Users size={16} />
                <span>{candidate.name}</span>
                <small>{candidate.branch}</small>
              </button>
            ))}
          </div>
          </Section>

          <Section title="Recently Verified">
          <div className="list-panel">
            {analytics.trends.recentlyVerified.map((candidate) => (
              <button key={candidate.id} type="button" onClick={() => navigate(`/hr/candidates/${candidate.id}`)}>
                <CheckCircle2 size={16} />
                <span>{candidate.name}</span>
                <small>{candidate.confidence}% confidence</small>
              </button>
            ))}
          </div>
          </Section>
        </div>
      ) : null}

      {showOverview || showHiring ? (
        <div className="two-column">
        <Section title="Most Common Skills">
          <div className="bar-list">
            {analytics.trends.mostCommonSkills.map((skill) => (
              <button key={skill.skill} type="button" onClick={() => openQuery(skill.query)}>
                <span>{skill.skill}</span>
                <strong>{skill.count}</strong>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Most Common Branches">
          <div className="bar-list">
            {analytics.trends.mostCommonBranches.map((branch) => (
              <button key={branch.branch} type="button" onClick={() => openQuery(branch.query)}>
                <span>{branch.branch}</span>
                <strong>{branch.count}</strong>
              </button>
            ))}
          </div>
        </Section>
        </div>
      ) : null}

      {showOverview ? (
        <Section title="Recent Activity">
        <div className="timeline">
          {analytics.recentActivity.map((activity, index) => (
            <button className="timeline-row-button" key={`${activity.candidateId}-${index}`} type="button" onClick={() => navigate(`/hr/candidates/${activity.candidateId}`)}>
              <strong>{activity.candidateName}</strong>
              <p>
                {activity.label}: {activity.detail}
              </p>
              <span>
                {activity.actor || "System"} · {formatDate(activity.createdAt)}
              </span>
            </button>
          ))}
        </div>
        </Section>
      ) : null}

      {showOverview || showHiring ? (
        <Section title="Internship Intelligence">
        <div className="metric-grid two">
          <InsightCard label="Candidates with proof" value={analytics.internship.withProof} detail="Professional claim supported" onClick={() => openQuery("internshipVerified=true")} />
          <InsightCard label="Candidates missing proof" value={analytics.internship.missingProof} detail="Evidence follow-up needed" tone="warning" onClick={() => openQuery("internshipVerified=false")} />
        </div>
        </Section>
      ) : null}
    </div>
  );
};
