import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./frontpage.jsx";
import Login from "./login.jsx";
import Staff from "./addStaff.jsx";
import Task from "./addTask.jsx";
import Dashboard from "./dashboard.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addStaff" element={<Staff />} />
        <Route path="/addTask" element={<Task />} />
      </Routes>
    </Router>
  </StrictMode>
);
