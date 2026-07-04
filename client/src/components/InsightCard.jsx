import { ArrowUpRight } from "lucide-react";

export const InsightCard = ({ label, value, detail, onClick, tone = "default" }) => {
  const Component = onClick ? "button" : "div";
  return (
    <Component className={`insight-card ${tone}`} onClick={onClick} type={onClick ? "button" : undefined}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      {onClick ? <ArrowUpRight size={18} aria-hidden="true" /> : null}
    </Component>
  );
};
