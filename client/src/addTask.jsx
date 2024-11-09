import * as React from "react";
import TextField from "@mui/material/TextField";
import "./addTask.css";
import { useNavigate } from "react-router-dom";

function AddTask() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleStaffClick = () => {
    navigate("/addStaff"); // Navigate to the Staff route when button is clicked
  };

  const handleLogoutClick = () => {
    navigate("/"); // Navigate to the Logout route when button is clicked
  };

  const handleDashboardClick = () => {
    navigate("/dashboard"); // Navigate to the Dashboard route when button is clicked
  };

  const handleManageClick = () => {
    navigate("/manage"); // Navigate to the Manage route when button is clicked
  };

  return (
    <div className="AddTask">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="logout-btn" onClick={handleLogoutClick}>Logout</button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn" onClick={handleDashboardClick}>Dashboard</button>
          <button className="sidebar-btn" onClick={handleManageClick}>Manage</button>
          <button className="sidebar-btn">Add Task</button>
          <button className="sidebar-btn" onClick={handleStaffClick}>Add Staff</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <h1 className="form-title">Add Task</h1>
          <div className="form-card">
            <form className="task-form">
              <div className="form-row">
                <TextField
                  className="payee"
                  id="standard-basic"
                  label="Payee Name"
                  variant="standard"
                />
                <TextField
                  className="type"
                  id="standard-basic"
                  label="Type"
                  variant="standard"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Date and Time</label>
                <input
                  className="dateTime"
                  type="datetime-local"
                  form="form-control"
                  placeholder="Date and Time"
                  required
                />
              </div>
              <button type="submit" className="add-btn">Send</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddTask;
