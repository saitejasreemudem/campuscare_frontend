
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function SubmitComplaint() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Electrical",
    location: "",
    priority: "MEDIUM",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/complaints", {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
      });

      navigate("/my-complaints", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your complaint. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
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
            <h2>Submit a Complaint</h2>
            <p>Tell us about a problem on your campus.</p>
          </div>

          <Link className="cc-button" to="/my-complaints">
            My Complaints
          </Link>
        </div>

        <section className="cc-card">
          <form className="cc-form" onSubmit={handleSubmit}>
            <label htmlFor="title">Complaint title *</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Fan not working"
              maxLength={120}
              required
            />

            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option>Electrical</option>
              <option>Plumbing</option>
              <option>Cleanliness</option>
              <option>Classroom</option>
              <option>Internet</option>
              <option>Furniture</option>
              <option>Other</option>
            </select>

            <label htmlFor="location">Location *</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. CSE Block - Room 204"
              maxLength={150}
              required
            />

            <label htmlFor="priority">Priority *</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain the problem clearly..."
              maxLength={2000}
              required
            />

            {error && <p className="form-error">{error}</p>}

            <div>
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>

              <Link
                to="/dashboard"
                style={{
                  marginLeft: "16px",
                  textDecoration: "none",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}