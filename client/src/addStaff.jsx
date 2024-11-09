import * as React from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import "./addStaff.css";
import { googleLogout } from "@react-oauth/google";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Staff() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleTaskClick = () => {
    navigate("/addTask"); // Navigate to the Task route when button is clicked
  };

  const handleLogoutClick = () => {
    googleLogout();
    onSuccess();
    navigate("/"); // Navigate to the Logout route when button is clicked
  };

  const handleDashboardClick = () => {
    navigate("/dashboard"); // Navigate to the Dashboard route when button is clicked
  };

  const handleManageClick = () => {
    navigate("/manage"); // Navigate to the Manage route when button is clicked
  };

  return (
    <div className="App">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="icon-button">👤</button>
          <button className="icon-button">🔔</button>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn" onClick={handleDashboardClick}>
            Dashboard
          </button>
          <button className="sidebar-btn" onClick={handleManageClick}>
            Manage
          </button>
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
