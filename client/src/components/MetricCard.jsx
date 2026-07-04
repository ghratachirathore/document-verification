import { ArrowUpRight } from "lucide-react";

export const MetricCard = ({ label, value, detail, onClick }) => {
  const Component = onClick ? "button" : "div";
  return (
    <Component className="metric-card" onClick={onClick} type={onClick ? "button" : undefined}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      {onClick ? <ArrowUpRight size={18} aria-hidden="true" /> : null}
    </Component>
  );
};
