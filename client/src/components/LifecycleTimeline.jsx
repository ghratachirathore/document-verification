import { CheckCircle2, CircleDashed, CircleDot, OctagonAlert } from "lucide-react";
import { formatDate } from "../utils/format";

const iconForStatus = (status) => {
  if (status === "blocked") return OctagonAlert;
  if (status === "current") return CircleDot;
  if (status === "pending") return CircleDashed;
  return CheckCircle2;
};

export const LifecycleTimeline = ({ items = [] }) => (
  <div className="lifecycle-timeline">
    {items.length ? (
      items.map((item, index) => {
        const Icon = iconForStatus(item.status);
        return (
          <div className={`lifecycle-step ${item.status || "completed"}`} key={`${item.label}-${index}`}>
            <div className="timeline-icon">
              <Icon size={17} />
            </div>
            <div>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
              <span>
                {item.actor || "System"} · {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        );
      })
    ) : (
      <p className="muted">No lifecycle activity yet.</p>
    )}
  </div>
);
