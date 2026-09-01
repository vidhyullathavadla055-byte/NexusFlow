import "./States.css";

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="ui-state ui-state--loading">
      <span className="ui-state-spinner" />
      {label}
    </div>
  );
}

export function EmptyState({ label = "Nothing here yet.", action }) {
  return (
    <div className="ui-state ui-state--empty">
      <span>{label}</span>
      {action}
    </div>
  );
}

export function ErrorState({ label = "Something went wrong.", onRetry }) {
  return (
    <div className="ui-state ui-state--error">
      <span>{label}</span>
      {onRetry && (
        <button type="button" className="ui-state-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
