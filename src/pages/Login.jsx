import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
        role,
      });

      const data = response.data;

      if (
        !data ||
        data.message !== "Login successful" ||
        !data.email ||
        !data.role
      ) {
        setError(data?.message || "Invalid login response from server.");
        return;
      }

      const userRole = data.role.toUpperCase();

      if (userRole !== role) {
        setError("The selected account type does not match your account.");
        return;
      }

      localStorage.removeItem("campuscareToken");
      localStorage.setItem("campuscareEmail", data.email);
      localStorage.setItem("campuscareRole", userRole);

      if (userRole === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else if (userRole === "STUDENT") {
        navigate("/dashboard", { replace: true });
      } else {
        setError("Unsupported account role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your email, password, and backend server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cc-auth-page">
      <section className="cc-auth-shell">
        {/* Top navigation */}
        <header className="cc-auth-topbar">
          <Link to="/login" className="cc-brand">
            <span className="cc-brand-logo">CC</span>
            <span>CampusCare</span>
          </Link>

          <span className="cc-brand-caption">
            Smart College Complaint &amp;
            <br />
            Maintenance System
          </span>
        </header>

        {/* Two-column content */}
        <div className="cc-auth-layout">
          {/* Left welcome panel */}
          <section className="cc-welcome-panel">
            <div className="cc-welcome-content">
              <span className="cc-eyebrow">
                <span className="cc-live-dot" />
                YOUR CAMPUS COMMUNITY
              </span>

              <h1>
                Your Campus.
                <br />
                Your Voice.
                <br />
                <span>Better Together.</span>
              </h1>

              <p className="cc-welcome-description">
                Report issues, track progress and help create a safer,
                smarter and more comfortable campus for everyone.
              </p>

              <div className="cc-feature-list">
                <div className="cc-feature-item">
                  <span className="cc-feature-icon">↗</span>
                  <div>
                    <strong>Report campus issues</strong>
                    <small>Raise complaints in a few clicks</small>
                  </div>
                </div>

                <div className="cc-feature-item">
                  <span className="cc-feature-icon">◷</span>
                  <div>
                    <strong>Track your progress</strong>
                    <small>Follow complaint status updates</small>
                  </div>
                </div>

                <div className="cc-feature-item">
                  <span className="cc-feature-icon">♢</span>
                  <div>
                    <strong>Create a better campus</strong>
                    <small>Help improve your college together</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="cc-campus-caption">
              <span className="cc-caption-line" />
              A better campus starts with you.
            </div>

            {/* Floating decorative glass card */}
            <div className="cc-floating-card">
              <span className="cc-floating-card-icon">✓</span>
              <span>
                <strong>Every voice matters</strong>
                <small>Let's make things better.</small>
              </span>
            </div>
          </section>

          {/* Right login panel */}
          <section className="cc-login-area">
            <div className="cc-login-card">
              <div className="cc-login-emblem">✦</div>

              <h2>Welcome Back</h2>
              <p className="cc-login-subtitle">
                Sign in to your CampusCare account
              </p>

              <form onSubmit={handleLogin}>
                <label className="cc-field-label">Account type</label>

                <div className="cc-role-selector">
                  <button
                    type="button"
                    className={
                      role === "STUDENT" ? "cc-role-option active" : "cc-role-option"
                    }
                    onClick={() => {
                      setRole("STUDENT");
                      setError("");
                    }}
                  >
                    <span>♟</span>
                    Student
                  </button>

                  <button
                    type="button"
                    className={
                      role === "ADMIN" ? "cc-role-option active" : "cc-role-option"
                    }
                    onClick={() => {
                      setRole("ADMIN");
                      setError("");
                    }}
                  >
                    <span>♙</span>
                    Administrator
                  </button>
                </div>

                <label className="cc-field-label" htmlFor="login-email">
                  Email address
                </label>

                <div className="cc-input-box">
                  <span className="cc-input-icon">✉</span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                <label className="cc-field-label" htmlFor="login-password">
                  Password
                </label>

                <div className="cc-input-box">
                  <span className="cc-input-icon">♙</span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="cc-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="cc-login-options">
                  <span className="cc-security-hint">
                    <span>✓</span> Secure sign in
                  </span>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>

                {error && (
                  <div className="cc-login-error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  className="cc-submit-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <span>→</span>}
                </button>
              </form>

              <div className="cc-divider">
                <span>WELCOME TO CAMPUSCARE</span>
              </div>

              <div className="cc-trust-note">
                <span>✧</span>
                Together for a safer, smarter campus.
              </div>

              <p className="cc-register-prompt">
                Don't have an account?
                <Link to="/register">Register now</Link>
              </p>
            </div>
          </section>
        </div>

        {/* Bottom footer */}
        <footer className="cc-auth-footer">
          <span>
            <span className="cc-footer-shield">♢</span>
            CampusCare
          </span>

          <span>Smart College Complaint &amp; Maintenance System</span>

          <span>♡ For a Better Campus</span>
        </footer>
      </section>
    </main>
  );
}