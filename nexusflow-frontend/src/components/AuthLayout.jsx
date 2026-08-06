import "./AuthLayout.css";

function PipelinePreview() {
  return (
    <div className="auth-pipeline" aria-hidden="true">
      <div className="auth-pipeline-node auth-pipeline-node--sensor">Sensor</div>
      <span className="auth-pipeline-wire" />
      <div className="auth-pipeline-node auth-pipeline-node--filter">Filter</div>
      <span className="auth-pipeline-wire" />
      <div className="auth-pipeline-node auth-pipeline-node--alert">Alert</div>
    </div>
  );
}

/**
 * Shared split-screen shell for /login and /signup.
 * Left: brand + value prop. Right: the form passed in as children.
 */
function AuthLayout({ title, subtitle, bullets = [], children }) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <span className="auth-logo-mark" />
            NexusFlow
          </div>

          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>

          {bullets.length > 0 && (
            <ul className="auth-bullets">
              {bullets.map((b) => (
                <li key={b}>
                  <span className="auth-check">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          <PipelinePreview />
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
