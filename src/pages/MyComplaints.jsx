
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/complaints");
      setComplaints(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load complaints. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch = [
        complaint.title,
        complaint.description,
        complaint.category,
        complaint.location,
        String(complaint.id ?? ""),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  const submitted = complaints.filter(
    (item) => item.status === "SUBMITTED"
  ).length;

  const inProgress = complaints.filter(
    (item) =>
      item.status === "IN_PROGRESS" ||
      item.status === "IN PROGRESS"
  ).length;

  const resolved = complaints.filter(
    (item) => item.status === "RESOLVED"
  ).length;

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString();
  }

  function statusClass(status) {
    if (status === "RESOLVED") return "resolved";
    if (
      status === "IN_PROGRESS" ||
      status === "IN PROGRESS"
    ) {
      return "in-progress";
    }
    return "";
  }

  return (
    <div>
      <header className="cc-header">
        <div>
          <h1>CampusCare</h1>
          <p>Complaint Tracking Portal</p>
        </div>
        <Link to="/dashboard">Dashboard</Link>
      </header>

      <main className="cc-page">
        <div className="cc-page-heading">
          <div>
            <h2>My Complaints</h2>
            <p>View complaints and check their current status.</p>
          </div>

          <Link className="cc-button" to="/submit-complaint">
            + New Complaint
          </Link>
        </div>

        <section className="cc-stats">
          <div className="cc-card">
            <p className="cc-stat-label">Total Complaints</p>
            <p className="cc-stat-value">{complaints.length}</p>
          </div>

          <div className="cc-card">
            <p className="cc-stat-label">Submitted</p>
            <p className="cc-stat-value">{submitted}</p>
          </div>

          <div className="cc-card">
            <p className="cc-stat-label">In Progress</p>
            <p className="cc-stat-value">{inProgress}</p>
          </div>

          <div className="cc-card">
            <p className="cc-stat-label">Resolved</p>
            <p className="cc-stat-value">{resolved}</p>
          </div>
        </section>

        <section className="cc-card" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              aria-label="Search complaints"
              placeholder="Search title, location, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 250px",
                padding: 12,
                border: "1px solid #d8e6dd",
                borderRadius: 9,
              }}
            />

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: 12,
                border: "1px solid #d8e6dd",
                borderRadius: 9,
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <button
              className="cc-button"
              onClick={loadComplaints}
              type="button"
            >
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="cc-card" style={{ marginBottom: 20 }}>
            <p className="form-error">{error}</p>
            <button className="cc-button" onClick={loadComplaints}>
              Try Again
            </button>
          </div>
        )}

        <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Complaint</th>
                <th>Category</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading complaints...</td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    {complaints.length === 0
                      ? "No complaints found. Submit your first complaint!"
                      : "No complaints match your search or status filter."}
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>#{complaint.id}</td>
                    <td>
                      <strong>{complaint.title}</strong>
                      <div
                        style={{
                          marginTop: 6,
                          color: "#71877d",
                          fontSize: 13,
                        }}
                      >
                        {complaint.description}
                      </div>
                    </td>
                    <td>{complaint.category || "—"}</td>
                    <td>{complaint.location || "—"}</td>
                    <td>{complaint.priority || "—"}</td>
                    <td>
                      <span
                        className={`cc-status ${statusClass(
                          complaint.status
                        )}`}
                      >
                        {(complaint.status || "UNKNOWN").replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </td>
                    <td>{formatDate(complaint.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <p style={{ color: "#71877d", fontSize: 13 }}>
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </p>
        )}
      </main>
    </div>
  );
}