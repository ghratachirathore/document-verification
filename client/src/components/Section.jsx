export const Section = ({ title, action, children, id }) => (
  <section id={id} className="section-block">
    <div className="section-heading">
      <h2>{title}</h2>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
    {children}
  </section>
);
