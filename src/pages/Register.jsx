
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        email: email.trim(),
        password,
        role,
      });

      setSuccess(
        response.data.message || "Registration successful!"
      );

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">CC</div>

        <h1>CampusCare</h1>

        <p className="auth-subtitle">
          Join your campus community.
        </p>

        <h2>Create account</h2>

        <p className="muted">
          Register for your CampusCare account.
        </p>

        <form onSubmit={handleRegister}>
          <label htmlFor="register-role">Account type</label>
          <select
            id="register-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Administrator</option>
          </select>

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}