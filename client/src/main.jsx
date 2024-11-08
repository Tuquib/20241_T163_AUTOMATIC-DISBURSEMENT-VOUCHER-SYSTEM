import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./frontpage.jsx";
import Login from "./login.jsx";
import Staff from "./addStaff.jsx";
import Task from "./addTask.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <GoogleOAuthProvider clientId="1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/addStaff" element={<Staff />} />
          <Route path="/addTask" element={<Task />} />
        </Routes>
      </GoogleOAuthProvider>
    </Router>
  </StrictMode>
);
