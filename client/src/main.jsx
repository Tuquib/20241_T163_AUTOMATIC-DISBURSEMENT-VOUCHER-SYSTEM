import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./frontpage.jsx";
import Login from "./login.jsx";
import Staff from "./admin/addStaff.jsx";
import Task from "./admin/addTask.jsx";
import Manage from "./admin/manage.jsx";
import Dashboard from "./admin/dashboard.jsx";
import StaffDashboard from "./staff/staffDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <GoogleOAuthProvider clientId="1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/addStaff" element={<Staff />} />
          <Route path="/addTask" element={<Task />} />
          <Route path="/staffDashboard" element={<StaffDashboard />} />
        </Routes>
      </GoogleOAuthProvider>
    </Router>
  </StrictMode>
);
