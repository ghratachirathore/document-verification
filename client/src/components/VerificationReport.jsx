import { DataTable } from "./DataTable.jsx";
import { StatusBadge } from "./StatusBadge.jsx";

export const VerificationReport = ({ checks = [] }) => (
  <DataTable
    emptyText="No verification report is available yet"
    columns={[
      { key: "label", label: "Verification Check" },
      { key: "evidenceUsed", label: "Evidence Used", render: (row) => row.evidenceUsed?.join(" + ") || "Not available" },
      { key: "confidence", label: "Confidence", render: (row) => `${row.confidence || 0}%` },
      { key: "finalStatus", label: "Final Status", render: (row) => <StatusBadge status={row.finalStatus || row.outcome} /> },
      { key: "reason", label: "Reason" },
      { key: "recommendedAction", label: "Recommended HR Action" }
    ]}
    rows={checks}
  />
);
