import { useNavigate } from "react-router-dom";
import { DataTable } from "./DataTable.jsx";
import { StatusBadge } from "./StatusBadge.jsx";

export const ReviewQueue = ({ rows = [], onQuickAction }) => {
  const navigate = useNavigate();

  return (
    <DataTable
      emptyText="No candidates require manual review"
      columns={[
        { key: "name", label: "Candidate Name" },
        { key: "status", label: "Verification Status", render: (row) => <StatusBadge status={row.status} /> },
        { key: "reason", label: "Reason for Review" },
        { key: "confidence", label: "Confidence", render: (row) => `${row.confidence || 0}%` },
        { key: "pendingAction", label: "Pending Action" },
        {
          key: "actions",
          label: "Quick Actions",
          render: (row) => (
            <div className="table-actions">
              <button className="table-action" type="button" onClick={() => navigate(`/hr/candidates/${row.id}`)}>
                Open
              </button>
              {onQuickAction ? (
                <button className="table-action subtle" type="button" onClick={() => onQuickAction(row)}>
                  Request
                </button>
              ) : null}
            </div>
          )
        }
      ]}
      rows={rows}
    />
  );
};
