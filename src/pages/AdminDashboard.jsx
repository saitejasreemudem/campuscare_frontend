
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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
          "Could not load complaints. Check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setError("");

    try {
      await API.put(
        `/complaints/${id}/status`,
        null,
        { params: { status } }
      );

      await loadComplaints();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update the complaint status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteComplaint(id) {
    const confirmed = window.confirm(
      `Are you sure you want to delete complaint #${id}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await API.delete(`/complaints/${id}`);
      setComplaints((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete this complaint."
      );
    }
  }

  function logout() {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareEmail");
    localStorage.removeItem("campuscareRole");
    navigate("/", { replace: true });
  }

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();

    return complaints.filter((item) => {
      const matchesSearch = [
        item.title,
        item.description,
        item.category,
        item.location,
        String(item.id ?? ""),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

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

  return (
    <div>
      <header className="cc-header">
        <div>
          <h1>CampusCare</h1>
          <p>Administrator Portal</p>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <main className="cc-page">
        <div className="cc-page-heading">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Review complaints and manage maintenance progress.</p>
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

        {error && (
          <div className="cc-card" style={{ marginBottom: 20 }}>
            <p className="form-error">{error}</p>
          </div>
        )}

        <section className="cc-card" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <input
              aria-label="Search complaints"
              placeholder="Search complaints..."
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
              aria-label="Filter complaints by status"
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
              type="button"
              className="cc-button"
              onClick={loadComplaints}
            >
              Refresh
            </button>
          </div>
        </section>

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
                <th>Update Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading complaints...</td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="8">No matching complaints found.</td>
                </tr>
              ) : (
                filteredComplaints.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <strong>{item.title}</strong>
                      <div style={{ marginTop: 6, fontSize: 13 }}>
                        {item.description}
                      </div>
                    </td>
                    <td>{item.category || "—"}</td>
                    <td>{item.location || "—"}</td>
                    <td>{item.priority || "—"}</td>
                    <td>
                      <span className="cc-status">
                        {(item.status || "UNKNOWN").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <select
                        aria-label={`Update complaint ${item.id} status`}
                        value={item.status || "SUBMITTED"}
                        disabled={updatingId === item.id}
                        onChange={(e) =>
                          updateStatus(item.id, e.target.value)
                        }
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => deleteComplaint(item.id)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #f0cccc",
                          borderRadius: 8,
                          background: "#fff0f0",
                          color: "#b42332",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ color: "#71877d", fontSize: 13 }}>
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </p>
      </main>
    </div>
  );
}