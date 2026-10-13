
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role: "STUDENT",
      });

      navigate("/login", {
        state: {
          message: "Registration successful! Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cc-auth-page">
      <div className="cc-auth-shell">

        {/* Top navigation */}
        <header className="cc-auth-topbar">
          <Link to="/login" className="cc-brand">
            <span className="cc-brand-logo">C</span>
            <span>
              <strong>CampusCare</strong>
              <small>SMART CAMPUS SOLUTIONS</small>
            </span>
          </Link>

          <div className="cc-topbar-right">
            <span>Already have an account?</span>
            <Link to="/login" className="cc-top-login">
              Sign in
            </Link>
          </div>
        </header>

        {/* Main split-screen layout */}
        <section className="cc-auth-layout">

          {/* Left campus information panel */}
          <div className="cc-welcome-panel">
            <div className="cc-campus-overlay" />

            <div className="cc-welcome-content">
              <span className="cc-eyebrow">
                <span className="cc-status-dot" />
                YOUR CAMPUS, BETTER CONNECTED
              </span>

              <h1>
                Be part of a
                <br />
                <span>better campus.</span>
              </h1>

              <p className="cc-welcome-description">
                Create your account and help make your campus
                safer, smarter, and more comfortable for everyone.
              </p>

              <div className="cc-feature-list">
                <div className="cc-feature-item">
                  <span className="cc-feature-icon">✓</span>
                  <div>
                    <strong>Report campus issues</strong>
                    <p>Submit complaints whenever you need.</p>
                  </div>
                </div>

                <div className="cc-feature-item">
                  <span className="cc-feature-icon">↗</span>
                  <div>
                    <strong>Track your complaints</strong>
                    <p>Follow updates on submitted issues.</p>
                  </div>
                </div>

                <div className="cc-feature-item">
                  <span className="cc-feature-icon">✦</span>
                  <div>
                    <strong>Make a real difference</strong>
                    <p>Help improve your college environment.</p>
                  </div>
                </div>
              </div>

              <div className="cc-floating-card">
                <span className="cc-floating-icon">✦</span>
                <div>
                  <strong>A better campus starts with you.</strong>
                  <p>One account. A better experience.</p>
                </div>
                <span className="cc-floating-check">✓</span>
              </div>
            </div>

            <div className="cc-panel-footer">
              <span>© 2026 CampusCare</span>
              <span>Built for a better campus</span>
            </div>
          </div>

          {/* Right registration form */}
          <div className="cc-login-area">
            <div className="cc-login-card cc-register-card">

              <div className="cc-login-emblem">
                <span>+</span>
              </div>

              <div className="cc-login-heading">
                <span className="cc-form-eyebrow">GET STARTED TODAY</span>
                <h2>Create your account</h2>
                <p className="cc-login-subtitle">
                  Join CampusCare and make campus life better.
                </p>
              </div>

              <form onSubmit={handleRegister}>

                <label className="cc-field-label" htmlFor="register-name">
                  Full name
                </label>
                <div className="cc-input-box">
                  <span className="cc-input-icon">♙</span>
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <label className="cc-field-label" htmlFor="register-email">
                  Email address
                </label>
                <div className="cc-input-box">
                  <span className="cc-input-icon">✉</span>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <label className="cc-field-label" htmlFor="register-password">
                  Password
                </label>
                <div className="cc-input-box">
                  <span className="cc-input-icon">♙</span>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="cc-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <label
                  className="cc-field-label"
                  htmlFor="register-confirm-password"
                >
                  Confirm password
                </label>
                <div className="cc-input-box">
                  <span className="cc-input-icon">♙</span>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="cc-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="cc-registration-notice">
                  <span>✓</span>
                  <p>
                    <strong>Student account</strong>
                    <br />
                    Registration creates a student account. Admin access
                    must be granted separately.
                  </p>
                </div>

                <label className="cc-register-terms">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span>
                    I agree to use CampusCare responsibly and provide
                    accurate information.
                  </span>
                </label>

                {error && (
                  <div className="cc-login-error" role="alert">
                    {typeof error === "string"
                      ? error
                      : "Registration failed. Please check your details."}
                  </div>
                )}

                <button
                  type="submit"
                  className="cc-submit-button"
                  disabled={loading}
                >
                  <span>{loading ? "Creating account..." : "Create account"}</span>
                  {!loading && <span className="cc-submit-arrow">→</span>}
                </button>
              </form>

              <div className="cc-divider">
                <span>ALREADY REGISTERED?</span>
              </div>

              <p className="cc-register-prompt">
                Already have an account?{" "}
                <Link to="/login">Sign in here</Link>
              </p>

              <p className="cc-secure-note">
                <span>♢</span> Your account details are protected.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
