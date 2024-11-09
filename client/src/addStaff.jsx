import * as React from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import "./addStaff.css";

function Staff() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleTaskClick = () => {
    navigate("/addTask"); // Navigate to the Login route when button is clicked
  };

  const handleLogoutClick = () => {
    navigate("/"); // Navigate to the Login route when button is clicked
  };

  return (
    <div className="App">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Acounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
          <button className="sidebar-btn">Manage</button>
          <button className="sidebar-btn" onClick={handleTaskClick}>
            Add Task
          </button>
          <button className="sidebar-btn">Add Staff</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <h1 className="form-title">Add Staff</h1>
          <div className="form-card">
            <form className="staff-form">
              <div className="form-row">
                <TextField
                  id="standard-basic"
                  label="Name"
                  variant="standard"
                />
                <TextField
                  id="standard-basic"
                  label="Position"
                  variant="standard"
                />
              </div>
              <div className="form-row">
                <TextField
                  className="payee"
                  id="standard-basic"
                  label="Contact Number"
                  variant="standard"
                />
                <TextField
                  className="payee"
                  id="standard-basic"
                  label="Email"
                  variant="standard"
                />
              </div>
              <button type="submit" className="add-btn">
                Add
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Staff;
