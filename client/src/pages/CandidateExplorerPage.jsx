import { RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, unwrap } from "../api/http";
import { DataTable } from "../components/DataTable.jsx";
import { ErrorState, LoadingState } from "../components/PageState.jsx";
import { Section } from "../components/Section.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/format";

const evidenceConfidence = (profile = {}) => {
  const evidence = profile.evidence || [];
  if (!evidence.length) return 0;
  return Math.round(evidence.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / evidence.length);
};

export const CandidateExplorerPage = () => {
  const [params, setParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: params.get("search") || "",
    skill: params.get("skill") || "",
    branch: params.get("branch") || "",
    status: params.get("status") || "",
    minCgpa: params.get("minCgpa") || "",
    maxCgpa: params.get("maxCgpa") || "",
    internshipVerified: params.get("internshipVerified") || "",
    uploadedToday: params.get("uploadedToday") || "",
    awaitingReview: params.get("awaitingReview") || "",
    clarificationPending: params.get("clarificationPending") || ""
  });

  const query = useMemo(() => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    return next;
  }, [filters]);

  useEffect(() => {
    setParams(query, { replace: true });
    setLoading(true);
    setError("");
    api
      .get(`/hr/candidates?${query.toString()}`)
      .then((response) => setCandidates(unwrap(response).candidates))
      .catch((err) => setError(err.response?.data?.message || "Failed to load candidates"))
      .finally(() => setLoading(false));
  }, [query, setParams]);

  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const clearFilters = () =>
    setFilters({
      search: "",
      skill: "",
      branch: "",
      status: "",
      minCgpa: "",
      maxCgpa: "",
      internshipVerified: "",
      uploadedToday: "",
      awaitingReview: "",
      clarificationPending: ""
    });

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Candidate Explorer</p>
          <h1>Searchable Candidate Intelligence Database</h1>
          <span>Search by name, branch, skills, status, internship proof, CGPA, and workflow state.</span>
        </div>
      </header>

      <Section title="Enterprise Filters">
        <div className="filter-bar expanded">
          <label>
            <Search size={16} />
            <input name="search" placeholder="Search name, skill, branch, status" value={filters.search} onChange={update} />
          </label>
          <input name="skill" placeholder="Skill" value={filters.skill} onChange={update} aria-label="Filter by skill" />
          <input name="branch" placeholder="Branch" value={filters.branch} onChange={update} aria-label="Filter by branch" />
          <input name="minCgpa" placeholder="Min CGPA" value={filters.minCgpa} onChange={update} inputMode="decimal" aria-label="Minimum CGPA" />
          <input name="maxCgpa" placeholder="Max CGPA" value={filters.maxCgpa} onChange={update} inputMode="decimal" aria-label="Maximum CGPA" />
          <select name="status" value={filters.status} onChange={update}>
            <option value="">All statuses</option>
            <option value="Verified">Verified</option>
            <option value="Verified With Minor Differences">Verified With Minor Differences</option>
            <option value="Needs Review">Needs Review</option>
            <option value="High Risk Inconsistency">High Risk Inconsistency</option>
          </select>
          <select name="internshipVerified" value={filters.internshipVerified} onChange={update}>
            <option value="">Internship evidence</option>
            <option value="true">Verified internship</option>
            <option value="false">Missing proof</option>
          </select>
          <select name="awaitingReview" value={filters.awaitingReview} onChange={update}>
            <option value="">HR review state</option>
            <option value="true">Awaiting HR review</option>
          </select>
          <select name="uploadedToday" value={filters.uploadedToday} onChange={update}>
            <option value="">Upload date</option>
            <option value="true">Uploaded today</option>
          </select>
          <select name="clarificationPending" value={filters.clarificationPending} onChange={update}>
            <option value="">Clarifications</option>
            <option value="true">Pending clarification</option>
          </select>
          <button className="icon-text-button" type="button" onClick={clearFilters}>
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </Section>

      {error ? <ErrorState title="Candidate search failed" message={error} /> : null}
      {loading ? <LoadingState title="Searching candidates" message="Applying filters to the candidate intelligence database." /> : null}

      <Section title={`Candidate List (${candidates.length})`}>
        <DataTable
          columns={[
            {
              key: "name",
              label: "Candidate",
              render: (row) => (
                <div className="candidate-cell">
                  <strong>{row.name}</strong>
                  <span>{row.email}</span>
                </div>
              )
            },
            { key: "branch", label: "Branch", render: (row) => row.candidateProfile?.branch || "Not extracted" },
            { key: "cgpa", label: "CGPA", render: (row) => row.candidateProfile?.cgpa || "-" },
            {
              key: "skills",
              label: "Top Skills",
              render: (row) => (
                <div className="chip-row compact">
                  {row.candidateProfile?.skills?.slice(0, 3).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              )
            },
            {
              key: "internship",
              label: "Internship Proof",
              render: (row) => <StatusBadge status={row.candidateProfile?.internships?.some((item) => item.hasProof) ? "Verified" : "Evidence Missing"} />
            },
            { key: "status", label: "Verification", render: (row) => <StatusBadge status={row.candidateProfile?.verificationStatus} /> },
            { key: "confidence", label: "Confidence", render: (row) => `${evidenceConfidence(row.candidateProfile)}%` },
            { key: "decision", label: "HR Decision", render: (row) => <StatusBadge status={row.candidateProfile?.hrDecision} /> },
            { key: "updated", label: "Last Updated", render: (row) => formatDate(row.candidateProfile?.lastUpdated || row.updatedAt) },
            { key: "open", label: "Workspace", render: (row) => <Link to={`/hr/candidates/${row._id}`}>Open</Link> }
          ]}
          rows={candidates}
        />
      </Section>
    </div>
  );
};
