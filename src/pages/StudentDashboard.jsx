
import { Link, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("campuscareEmail") || "Student";

  function handleLogout() {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareEmail");
    localStorage.removeItem("campuscareRole");
    navigate("/", { replace: true });
  }

  return (
    <div>
      <header className="cc-header">
        <div>
          <h1>CampusCare</h1>
          <p>Complaint Tracking Portal</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="cc-page">
        <div className="cc-page-heading">
          <div>
            <h2>Student Dashboard</h2>
            <p>Welcome back, {email}!</p>
          </div>
        </div>

        <div className="cc-stats">
          <div className="cc-card">
            <p className="cc-stat-label">Report a Problem</p>
            <p className="cc-stat-value">01</p>
            <p>Tell us about a campus issue.</p>
            <Link className="cc-button" to="/submit-complaint">
              + New Complaint
            </Link>
          </div>

          <div className="cc-card">
            <p className="cc-stat-label">Track Complaints</p>
            <p className="cc-stat-value">02</p>
            <p>Check the progress of your reports.</p>
            <Link className="cc-button" to="/my-complaints">
              View Complaints
            </Link>
          </div>
        </div>

        <section className="cc-card">
          <h2>How CampusCare works</h2>
          <p>1. Submit a complaint with its category and location.</p>
          <p>2. Track its status from your complaints page.</p>
          <p>3. Check again after the maintenance team updates it.</p>
        </section>
      </main>
    </div>
  );
}