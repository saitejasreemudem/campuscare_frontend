
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const getStatus = (complaint) =>
  String(complaint.status || "SUBMITTED")
    .toUpperCase()
    .replaceAll("_", " ");

const normalizedStatus = (complaint) =>
  String(complaint.status || "SUBMITTED")
    .toUpperCase()
    .replaceAll(" ", "_");

const isResolved = (complaint) =>
  ["RESOLVED", "COMPLETED"].includes(normalizedStatus(complaint));

const isInProgress = (complaint) =>
  ["IN_PROGRESS", "PROCESSING"].includes(normalizedStatus(complaint));

function formatDate(dateValue) {
  if (!dateValue) return "Recently submitted";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategoryIcon(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("electric")) return "ϟ";
  if (value.includes("clean")) return "✧";
  if (value.includes("water")) return "≈";
  if (value.includes("plumb")) return "⌁";
  if (value.includes("internet") || value.includes("network")) return "⌘";
  if (value.includes("furniture")) return "▤";

  return "▤";
}

function getStatusClass(complaint) {
  const status = normalizedStatus(complaint);

  if (["RESOLVED", "COMPLETED"].includes(status)) {
    return "pill-resolved";
  }

  if (["IN_PROGRESS", "PROCESSING"].includes(status)) {
    return "pill-progress";
  }

  return "pill-pending";
}

function CampusIllustration() {
  return (
    <div
      className="dash-hero-visual"
      aria-label="Animated CampusCare campus illustration"
    >
      <div className="hero-ring hero-ring-one" />
      <div className="hero-ring hero-ring-two" />

      <div className="hero-floating-chip chip-top">
        <span className="chip-icon">✦</span>
        Smarter campus
      </div>

      <div className="hero-glass-card">
        <div className="hero-building-icon">
          <svg
            viewBox="0 0 180 150"
            role="img"
            aria-label="Campus building illustration"
          >
            <path
              d="M28 135V48L90 18L152 48V135"
              fill="#d8f5e9"
              stroke="#087f5b"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            <path
              d="M18 135H162"
              stroke="#087f5b"
              strokeWidth="5"
              strokeLinecap="round"
            />

            <path
              d="M43 59H137M43 82H137M43 105H137"
              stroke="#8bd8bb"
              strokeWidth="3"
            />

            <g fill="#0d9870">
              <rect x="43" y="64" width="15" height="12" rx="2" />
              <rect x="67" y="64" width="15" height="12" rx="2" />
              <rect x="98" y="64" width="15" height="12" rx="2" />
              <rect x="122" y="64" width="15" height="12" rx="2" />

              <rect x="43" y="87" width="15" height="12" rx="2" />
              <rect x="67" y="87" width="15" height="12" rx="2" />
              <rect x="98" y="87" width="15" height="12" rx="2" />
              <rect x="122" y="87" width="15" height="12" rx="2" />
            </g>

            <path
              d="M77 135V111Q90 96 103 111V135"
              fill="#078765"
            />

            <path
              d="M90 18V4M80 5H100"
              stroke="#087f5b"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="hero-card-caption">
          <span className="hero-sparkle">✦</span>
          <div>
            <strong>Small actions.</strong>
            <p>Big campus impact.</p>
          </div>
        </div>
      </div>

      <div className="hero-floating-chip chip-bottom">
        <span className="chip-status-dot" />
        Your voice matters
      </div>

      <span className="hero-deco deco-one">✳</span>
      <span className="hero-deco deco-two">✦</span>
      <span className="hero-deco deco-three">＋</span>
    </div>
  );
}

function StatCard({
  icon,
  badge,
  label,
  value,
  footnote,
  color = "green",
  decoration = "one",
}) {
  return (
    <article className={`dash-stat-card stat-${color}`}>
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-badge">{badge}</span>
      </div>

      <p className="stat-label">{label}</p>

      <div className="stat-number">
        {value}
        <span className="stat-number-symbol">↗</span>
      </div>

      <p className="stat-footnote">{footnote}</p>

      <div className={`stat-decoration stat-decoration-${decoration}`} />
    </article>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const email =
    localStorage.getItem("campuscareEmail") || "Campus member";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComplaints() {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/complaints");

      const data = Array.isArray(response.data) ? response.data : [];

      const sorted = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      });

      setComplaints(sorted);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load campus complaints. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchComplaints() {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/complaints");

        const data = Array.isArray(response.data) ? response.data : [];

        const sorted = [...data].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();

          return dateB - dateA;
        });

        if (active) {
          setComplaints(sorted);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Couldn't load campus complaints. Check that your backend is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchComplaints();

    return () => {
      active = false;
    };
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter(isResolved).length;
  const inProgress = complaints.filter(isInProgress).length;
  const pending = total - resolved - inProgress;

  const firstName = email.includes("@")
    ? email.split("@")[0].split(/[._-]/)[0]
    : email;

  function logout() {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareEmail");
    localStorage.removeItem("campuscareRole");

    navigate("/", { replace: true });
  }

  return (
    <div className="student-app">
      <div className="dashboard-orb dashboard-orb-one" />
      <div className="dashboard-orb dashboard-orb-two" />

      <header className="dash-header">
        <Link to="/dashboard" className="dash-brand">
          <span className="dash-brand-icon">CC</span>

          <span>
            <strong>CampusCare</strong>
            <small>Smart campus. Better together.</small>
          </span>
        </Link>

        <nav className="dash-nav">
          <Link className="dash-nav-active" to="/dashboard">
            Overview
          </Link>

          <Link to="/submit-complaint">Report Issue</Link>

          <Link to="/my-complaints">Complaints</Link>
        </nav>

        <button
          className="dash-logout"
          onClick={logout}
          type="button"
        >
          <span>↗</span> Logout
        </button>
      </header>

      <main className="dash-main">
        <section className="dash-welcome">
          <div className="dash-welcome-copy">
            <span className="dash-eyebrow">
              <span className="live-dot" />
              YOUR CAMPUS, YOUR VOICE
            </span>

            <h1>
              A better campus
              <br />
              starts with <span>you.</span>
            </h1>

            <p>
              Hello, {firstName}! Report campus issues, follow their
              progress, and help make your college a better place
              for everyone.
            </p>

            <div className="dash-welcome-actions">
              <Link
                to="/submit-complaint"
                className="dash-primary-action"
              >
                <span className="action-plus">＋</span>
                Report an issue
                <span className="action-arrow">→</span>
              </Link>

              <Link
                to="/my-complaints"
                className="dash-secondary-action"
              >
                Track complaints <span>↗</span>
              </Link>
            </div>

            <div className="dash-trust-line">
              <span className="trust-check">✓</span>
              Every report helps improve campus life
            </div>
          </div>

          <CampusIllustration />
        </section>

        <section className="dash-section-heading">
          <div>
            <span className="dash-section-kicker">
              CAMPUS OVERVIEW
            </span>

            <h2>Making progress together</h2>

            <p>
              Here's a live snapshot of reported campus issues.
            </p>
          </div>

          <button
            className="dash-refresh"
            type="button"
            onClick={loadComplaints}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh data"}
          </button>
        </section>

        {error && (
          <div className="dash-error" role="alert">
            <span>!</span>

            <div>
              <strong>Couldn't load the latest data</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <section
          className="dash-stats"
          aria-label="Campus complaint statistics"
        >
          <StatCard
            icon="▤"
            badge="ALL REPORTS"
            label="Campus complaints"
            value={loading ? "—" : total}
            footnote="Reports submitted to the system"
            color="green"
            decoration="one"
          />

          <StatCard
            icon="◷"
            badge="IN PROGRESS"
            label="Being addressed"
            value={loading ? "—" : inProgress}
            footnote="Issues currently being worked on"
            color="blue"
            decoration="two"
          />

          <StatCard
            icon="◌"
            badge="AWAITING ACTION"
            label="Awaiting action"
            value={loading ? "—" : pending}
            footnote="Not yet resolved or in progress"
            color="amber"
            decoration="three"
          />

          <StatCard
            icon="✓"
            badge="COMPLETED"
            label="Resolved issues"
            value={loading ? "—" : resolved}
            footnote="Campus issues marked resolved"
            color="purple"
            decoration="four"
          />
        </section>

        <section className="dash-content-grid">
          <div className="dash-panel dash-recent-panel">
            <div className="dash-panel-heading">
              <div>
                <span className="dash-section-kicker">
                  LATEST ACTIVITY
                </span>

                <h2>Recent campus reports</h2>
              </div>

              <Link
                to="/my-complaints"
                className="dash-text-link"
              >
                View all <span>→</span>
              </Link>
            </div>

            {loading ? (
              <div className="dash-empty-state">
                <div className="dash-loading-spinner" />
                <p>Loading campus reports...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="dash-empty-state">
                <div className="empty-state-icon">✧</div>

                <h3>A fresh start!</h3>

                <p>
                  No complaints have been recorded yet. Help make
                  campus better by reporting the first issue.
                </p>

                <Link
                  to="/submit-complaint"
                  className="dash-primary-action"
                >
                  Submit a report <span>→</span>
                </Link>
              </div>
            ) : (
              <div className="dash-recent-list">
                {complaints.slice(0, 5).map((complaint, index) => (
                  <article
                    className="dash-report-row"
                    key={complaint.id ?? `${complaint.title}-${index}`}
                  >
                    <div className="report-category-icon">
                      {getCategoryIcon(complaint.category)}
                    </div>

                    <div className="report-main">
                      <strong>
                        {complaint.title || "Untitled complaint"}
                      </strong>

                      <p>
                        {complaint.category || "General"} ·{" "}
                        {complaint.location || "Location not specified"}
                      </p>

                      <span className="report-date">
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`dash-status-pill ${getStatusClass(
                        complaint
                      )}`}
                    >
                      {getStatus(complaint)}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="dash-side-column">
            <div className="dash-panel dash-quick-panel">
              <span className="dash-section-kicker">
                QUICK ACCESS
              </span>

              <h2>What would you like to do?</h2>

              <p className="quick-intro">
                Choose an action to keep your campus moving forward.
              </p>

              <Link
                to="/submit-complaint"
                className="quick-action-card"
              >
                <span className="quick-action-icon quick-icon-green">
                  ＋
                </span>

                <span className="quick-action-copy">
                  <strong>Report an issue</strong>
                  <small>Tell us what needs fixing</small>
                </span>

                <span className="quick-arrow">↗</span>
              </Link>

              <Link
                to="/my-complaints"
                className="quick-action-card"
              >
                <span className="quick-action-icon quick-icon-blue">
                  ◷
                </span>

                <span className="quick-action-copy">
                  <strong>Track progress</strong>
                  <small>Check complaint status</small>
                </span>

                <span className="quick-arrow">↗</span>
              </Link>

              <div className="quick-tip">
                <span className="tip-light">✦</span>

                <div>
                  <strong>Campus tip</strong>

                  <p>
                    Include a clear location and description when
                    reporting an issue. It helps your campus team
                    respond faster.
                  </p>
                </div>
              </div>
            </div>

            <div className="dash-impact-card">
              <div className="impact-icon">♡</div>

              <span className="dash-section-kicker">
                BETTER TOGETHER
              </span>

              <h2>Your voice creates change.</h2>

              <p>
                Every thoughtful report is a step toward a safer,
                cleaner, more welcoming campus.
              </p>

              <div className="impact-progress-track">
                <span />
              </div>

              <small>
                One report can make a difference.
              </small>
            </div>
          </aside>
        </section>

        <footer className="dash-footer">
          <span>
            © {new Date().getFullYear()} CampusCare
          </span>

          <span>
            Built for a smarter, safer campus <b>♥</b>
          </span>
        </footer>
      </main>
    </div>
  );
}
