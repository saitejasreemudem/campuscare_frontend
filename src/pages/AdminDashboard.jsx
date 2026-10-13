import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const normalizeStatus = (complaint) =>
  String(complaint.status || "SUBMITTED").toUpperCase().replaceAll(" ", "_");

const statusLabel = (complaint) =>
  normalizeStatus(complaint).replaceAll("_", " ");

const isResolved = (complaint) =>
  ["RESOLVED", "COMPLETED"].includes(normalizeStatus(complaint));

const isInProgress = (complaint) =>
  ["IN_PROGRESS", "PROCESSING"].includes(normalizeStatus(complaint));

function formatDate(value) {
  if (!value) return "Recently submitted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(complaint) {
  if (isResolved(complaint)) return "pill-resolved";
  if (isInProgress(complaint)) return "pill-progress";
  return "pill-pending";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("campuscareEmail") || "Administrator";

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [savingId, setSavingId] = useState(null);

  async function loadComplaints() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await API.get("/complaints");
      const data = Array.isArray(response.data) ? response.data : [];
      data.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      setComplaints(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load complaints. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter(isResolved).length;
  const inProgress = complaints.filter(isInProgress).length;
  const pending = total - resolved - inProgress;

  const categories = useMemo(
    () => [...new Set(complaints.map((c) => c.category).filter(Boolean))].sort(),
    [complaints]
  );

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchesSearch = !query || [
        c.title,
        c.description,
        c.location,
        c.category,
        c.email,
        c.studentEmail,
        c.studentName,
        c.assignedTo,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      const status = normalizeStatus(c);
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || c.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, search, statusFilter, categoryFilter]);

  async function updateStatus(complaint, newStatus) {
    if (!complaint.id) {
      setError("This complaint has no ID, so its status cannot be updated.");
      return;
    }
    setSavingId(complaint.id);
    setError("");
    setNotice("");
    try {
      // If your backend expects a query parameter instead of JSON, use:
      // await API.put(`/complaints/${complaint.id}/status`, null, { params: { status: newStatus } });
      await API.put(`/complaints/${complaint.id}/status`, {
        status: newStatus,
      });
      setComplaints((current) =>
        current.map((item) =>
          item.id === complaint.id ? { ...item, status: newStatus } : item
        )
      );
      setNotice(`Complaint #${complaint.id} updated to ${newStatus.replaceAll("_", " ")}.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Status update failed. Check the status endpoint in ComplaintController."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function deleteComplaint(complaint) {
    if (!complaint.id) return;
    const confirmed = window.confirm(
      `Delete complaint "${complaint.title || `#${complaint.id}`}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setSavingId(complaint.id);
    setError("");
    setNotice("");
    try {
      await API.delete(`/complaints/${complaint.id}`);
      setComplaints((current) =>
        current.filter((item) => item.id !== complaint.id)
      );
      setNotice(`Complaint #${complaint.id} was deleted.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Delete failed. Check that DELETE /complaints/{id} exists in your backend."
      );
    } finally {
      setSavingId(null);
    }
  }

  function logout() {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareEmail");
    localStorage.removeItem("campuscareRole");
    navigate("/", { replace: true });
  }

  return (
    <div className="student-app admin-app">
      <div className="dashboard-orb dashboard-orb-one" />
      <div className="dashboard-orb dashboard-orb-two" />

      <header className="dash-header">
        <Link to="/admin" className="dash-brand">
          <span className="dash-brand-icon">CC</span>
          <span>
            <strong>CampusCare</strong>
            <small>Administrator workspace</small>
          </span>
        </Link>

        <nav className="dash-nav">
          <Link className="dash-nav-active" to="/admin">Overview</Link>
          <a href="#all-complaints">Manage complaints</a>
        </nav>

        <button className="dash-logout" onClick={logout} type="button">
          <span>↗</span> Logout
        </button>
      </header>

      <main className="dash-main">
        <section className="dash-welcome admin-welcome">
          <div className="dash-welcome-copy">
            <span className="dash-eyebrow">
              <span className="live-dot" />
              ADMINISTRATION CENTER
            </span>
            <h1>
              Your campus.
              <br />
              <span>Your team.</span> Your impact.
            </h1>
            <p>
              Welcome, {email.split("@")[0]}. Review incoming reports, update
              complaint progress, and help your campus team resolve issues.
            </p>
            <div className="dash-welcome-actions">
              <a href="#all-complaints" className="dash-primary-action">
                Manage complaints <span className="action-arrow">→</span>
              </a>
              <button
                className="dash-secondary-action"
                type="button"
                onClick={loadComplaints}
                disabled={loading}
              >
                ↻ {loading ? "Refreshing..." : "Refresh overview"}
              </button>
            </div>
            <div className="dash-trust-line">
              <span className="trust-check">✓</span>
              Every update helps keep campus running smoothly
            </div>
          </div>

          <div className="dash-hero-visual admin-hero-visual" aria-label="CampusCare administration illustration">
            <div className="hero-ring hero-ring-one" />
            <div className="hero-ring hero-ring-two" />
            <div className="hero-floating-chip chip-top">
              <span className="chip-icon">✦</span> Admin control center
            </div>
            <div className="hero-glass-card">
              <div className="hero-building-icon">
                <svg viewBox="0 0 180 150" role="img" aria-label="Campus building illustration">
                  <path d="M28 135V48L90 18L152 48V135" fill="#d8f5e9" stroke="#087f5b" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M18 135H162" stroke="#087f5b" strokeWidth="5" strokeLinecap="round" />
                  <path d="M43 59H137M43 82H137M43 105H137" stroke="#8bd8bb" strokeWidth="3" />
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
                  <path d="M77 135V111Q90 96 103 111V135" fill="#078765" />
                  <path d="M90 18V4M80 5H100" stroke="#087f5b" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="hero-card-caption">
                <span className="hero-sparkle">✦</span>
                <div><strong>Review. Respond.</strong><p>Make campus better.</p></div>
              </div>
            </div>
            <div className="hero-floating-chip chip-bottom">
              <span className="chip-status-dot" /> Reports at a glance
            </div>
            <span className="hero-deco deco-one">✳</span>
            <span className="hero-deco deco-two">✦</span>
            <span className="hero-deco deco-three">＋</span>
          </div>
        </section>

        <section className="dash-section-heading">
          <div>
            <span className="dash-section-kicker">CAMPUS OVERVIEW</span>
            <h2>Complaint management</h2>
            <p>A live snapshot of issues reported by students.</p>
          </div>
          <button className="dash-refresh" type="button" onClick={loadComplaints} disabled={loading}>
            ↻ {loading ? "Loading..." : "Refresh data"}
          </button>
        </section>

        {error && <div className="dash-error" role="alert"><span>!</span><div><strong>Action needs attention</strong><p>{error}</p></div></div>}
        {notice && <div className="admin-notice" role="status"><span>✓</span>{notice}</div>}

        <section className="dash-stats" aria-label="Complaint statistics">
          <article className="dash-stat-card stat-green">
            <div className="stat-card-top"><span className="stat-icon">▤</span><span className="stat-badge">ALL REPORTS</span></div>
            <p className="stat-label">Total complaints</p>
            <div className="stat-number">{loading ? "—" : total}<span className="stat-number-symbol">↗</span></div>
            <p className="stat-footnote">All reports in the system</p><div className="stat-decoration stat-decoration-one" />
          </article>
          <article className="dash-stat-card stat-blue">
            <div className="stat-card-top"><span className="stat-icon">◷</span><span className="stat-badge">IN PROGRESS</span></div>
            <p className="stat-label">Being addressed</p>
            <div className="stat-number">{loading ? "—" : inProgress}<span className="stat-number-symbol">↗</span></div>
            <p className="stat-footnote">Issues being worked on</p><div className="stat-decoration stat-decoration-two" />
          </article>
          <article className="dash-stat-card stat-amber">
            <div className="stat-card-top"><span className="stat-icon">◌</span><span className="stat-badge">PENDING</span></div>
            <p className="stat-label">Awaiting action</p>
            <div className="stat-number">{loading ? "—" : pending}<span className="stat-number-symbol">↗</span></div>
            <p className="stat-footnote">Need review or assignment</p><div className="stat-decoration stat-decoration-three" />
          </article>
          <article className="dash-stat-card stat-purple">
            <div className="stat-card-top"><span className="stat-icon">✓</span><span className="stat-badge">COMPLETED</span></div>
            <p className="stat-label">Resolved issues</p>
            <div className="stat-number">{loading ? "—" : resolved}<span className="stat-number-symbol">↗</span></div>
            <p className="stat-footnote">Marked as resolved</p><div className="stat-decoration stat-decoration-four" />
          </article>
        </section>

        <section className="dash-panel admin-complaints-panel" id="all-complaints">
          <div className="dash-panel-heading admin-list-heading">
            <div>
              <span className="dash-section-kicker">ADMIN TOOLS</span>
              <h2>All campus complaints</h2>
              <p>Search reports, filter the list, and update each complaint's status.</p>
            </div>
            <span className="admin-result-count">{filteredComplaints.length} shown</span>
          </div>

          <div className="admin-filters">
            <label className="admin-search">
              <span>⌕</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, location, student..." />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="ALL">All statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="PROCESSING">Processing</option>
              <option value="RESOLVED">Resolved</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category">
              <option value="ALL">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="dash-empty-state"><div className="dash-loading-spinner" /><p>Loading complaints...</p></div>
          ) : filteredComplaints.length === 0 ? (
            <div className="dash-empty-state"><div className="empty-state-icon">✧</div><h3>No matching complaints</h3><p>Try another search or filter. New reports will appear here.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Complaint</th><th>Student</th><th>Location</th><th>Submitted</th><th>Status</th><th>Update status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint, index) => (
                    <tr key={complaint.id ?? `${complaint.title}-${index}`}>
                      <td>
                        <strong>{complaint.title || "Untitled complaint"}</strong>
                        <small>{complaint.category || "General"}{complaint.priority ? ` · ${complaint.priority}` : ""}</small>
                        {complaint.description && <p className="admin-description">{complaint.description}</p>}
                      </td>
                      <td>{complaint.studentName || complaint.studentEmail || complaint.email || "Not provided"}</td>
                      <td>{complaint.location || "Not specified"}</td>
                      <td>{formatDate(complaint.createdAt)}</td>
                      <td><span className={`dash-status-pill ${statusClass(complaint)}`}>{statusLabel(complaint)}</span></td>
                      <td>
                        <select
                          className="admin-status-select"
                          aria-label={`Update status for complaint ${complaint.id}`}
                          value={normalizeStatus(complaint)}
                          disabled={savingId === complaint.id}
                          onChange={(e) => updateStatus(complaint, e.target.value)}
                        >
                          <option value="SUBMITTED">Submitted</option>
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                        {savingId === complaint.id && <small className="admin-saving">Saving...</small>}
                      </td>
                      <td><button className="admin-delete-button" type="button" disabled={savingId === complaint.id} onClick={() => deleteComplaint(complaint)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="dash-footer">
          <span>© {new Date().getFullYear()} CampusCare</span>
          <span>Admin workspace · Better campus, together <b>♥</b></span>
        </footer>
      </main>
    </div>
  );
}
