export const formatDate = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
};

export const statusTone = (status = "") => {
  if (status.includes("High Risk")) return "danger";
  if (status.includes("Needs Review")) return "warning";
  if (status.includes("Minor")) return "info";
  if (status.includes("Verified")) return "success";
  return "neutral";
};
