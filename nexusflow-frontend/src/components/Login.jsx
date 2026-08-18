import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../context/AuthContext";
import "./AuthForm.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Visual IoT Telemetry & Rule Engine"
      subtitle="Drag-and-drop sensor pipelines that alert your team the moment a machine misbehaves."
      bullets={["Live turbine & sensor monitoring", "No-code rule pipelines", "Instant SMS / Webhook alerts"]}
    >
      <h2 className="auth-card-title">Welcome back</h2>
      <p className="auth-card-subtitle">Login to manage your telemetry pipelines</p>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {error && <div className="auth-error">{error}</div>}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="manager@nexusflow.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span>
            Password
            <Link to="#" className="auth-forgot" onClick={(e) => e.preventDefault()}>
              Forgot?
            </Link>
          </span>
          <div className="auth-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
