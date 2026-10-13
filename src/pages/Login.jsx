
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

      // Your current backend does not issue a real token.
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">CC</div>

        <h1>CampusCare</h1>

        <p className="auth-subtitle">
          Your campus. Your voice. Better together.
        </p>

        <h2>Welcome back</h2>
        <p className="muted">Sign in to continue.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="login-role">Account type</label>
          <select
            id="login-role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setError("");
            }}
          >
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Administrator</option>
          </select>

          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">Password</label>

          <div className="password-field">
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
              className="password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register now</Link>
        </p>
      </div>
    </div>
  );
}