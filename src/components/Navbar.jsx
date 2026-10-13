
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ subtitle = "Complaint Tracking Portal" }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("campuscareRole");

  function logout() {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareEmail");
    localStorage.removeItem("campuscareRole");
    navigate("/", { replace: true });
  }

  return (
    <header className="cc-header">
      <div>
        <h1>CampusCare</h1>
        <p>{subtitle}</p>
      </div>

      <nav className="cc-nav">
        {role === "ADMIN" ? (
          <Link to="/admin-dashboard">Dashboard</Link>
        ) : (
          <Link to="/dashboard">Dashboard</Link>
        )}

        <Link to="/submit-complaint">Submit Complaint</Link>
        <Link to="/my-complaints">My Complaints</Link>

        <button type="button" onClick={logout}>
          Logout
        </button>
      </nav>
    </header>
  );
}