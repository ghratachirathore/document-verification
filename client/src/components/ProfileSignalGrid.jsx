export const ProfileSignalGrid = ({ items = [] }) => (
  <div className="signal-grid">
    {items.length ? (
      items.map((item) => (
        <div className="signal-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.detail ? <small>{item.detail}</small> : null}
        </div>
      ))
    ) : (
      <p className="muted">No profile signals available yet.</p>
    )}
  </div>
);
