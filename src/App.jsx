
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import SubmitComplaint from "./pages/SubmitComplaint.jsx";
import MyComplaints from "./pages/MyComplaints.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route
          path="/submit-complaint"
          element={<SubmitComplaint />}
        />
        <Route
          path="/my-complaints"
          element={<MyComplaints />}
        />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;