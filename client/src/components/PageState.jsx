import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";

export const LoadingState = ({ title = "Loading", message = "Preparing workspace data..." }) => (
  <div className="page-state">
    <div className="skeleton-grid" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <Loader2 className="spin" size={24} />
    <strong>{title}</strong>
    <span>{message}</span>
  </div>
);

export const ErrorState = ({ title = "Something went wrong", message, onRetry }) => (
  <div className="page-state error">
    <AlertCircle size={24} />
    <strong>{title}</strong>
    <span>{message || "Please retry the request."}</span>
    {onRetry ? (
      <button className="icon-text-button solid" type="button" onClick={onRetry}>
        <RefreshCw size={16} />
        Retry
      </button>
    ) : null}
  </div>
);

export const EmptyState = ({ title = "No records found", message = "There is nothing to display yet." }) => (
  <div className="page-state empty">
    <Inbox size={24} />
    <strong>{title}</strong>
    <span>{message}</span>
  </div>
);
