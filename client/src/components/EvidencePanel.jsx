import { DataTable } from "./DataTable.jsx";
import { StatusBadge } from "./StatusBadge.jsx";

export const EvidencePanel = ({ evidence = [], compact = false }) => (
  <div className={compact ? "evidence-panel compact" : "evidence-panel"}>
    <DataTable
      emptyText="No evidence has been generated yet"
      columns={[
        { key: "category", label: "Area" },
        { key: "claim", label: "Candidate Claim" },
        { key: "evidenceUsed", label: "Evidence Used", render: (row) => row.evidenceUsed?.join(" + ") || "Not available" },
        { key: "confidence", label: "Confidence", render: (row) => `${row.confidence || 0}%` },
        { key: "status", label: "Evidence Status", render: (row) => <StatusBadge status={row.status} /> },
        { key: "reason", label: "Reason" }
      ]}
      rows={evidence}
    />
  </div>
);
