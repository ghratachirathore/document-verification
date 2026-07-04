import { statusTone } from "../utils/format";

export const StatusBadge = ({ status }) => <span className={`status-badge ${statusTone(status)}`}>{status || "Pending"}</span>;
