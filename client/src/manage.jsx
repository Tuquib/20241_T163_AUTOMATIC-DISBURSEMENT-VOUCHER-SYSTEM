import React from 'react';
import './manage.css';
import { useNavigate } from "react-router-dom";

function manage() {
        const navigate = useNavigate(); // Initialize useNavigate
      
        const handleTaskClick = () => {
          navigate("/addTask"); // Navigate to the Task route when button is clicked
        };

        const handleStaffClick = () => {
            navigate("/addStaff"); // Navigate to the Staff route when button is clicked
          };
      
        const handleLogoutClick = () => {
          navigate("/"); // Navigate to the Logout route when button is clicked
        };
      
        const handleDashboardClick = () => {
          navigate("/dashboard"); // Navigate to the Dashboard route when button is clicked
        };

  return (
    <div className="manage">
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
          <button className="logout-btn" onClick={handleLogoutClick}>Logout</button>
        </nav>
      </header>
      <aside className="sidebar">
          <button className="sidebar-btn" onClick={handleDashboardClick}>Dashboard</button>
          <button className="sidebar-btn">Manage</button>
          <button className="sidebar-btn" onClick={handleTaskClick}>Add Task</button>
          <button className="sidebar-btn" onClick={handleStaffClick}>Add Staff</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
      <div className="content">
        <main className="main-content">
          <h2>Voucher Made</h2>
          <table className="voucher-table">
            <thead>
              <tr>
                <th>Voucher Name</th>
                <th>Time</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name 1</td>
                <td>Time 1</td>
                <td>Date 1</td>
                <td>
                  <button className="update-button">UPDATE</button>
                  <button className="delete-button">DELETE</button>
                </td>
              </tr>
              <tr>
                <td>Name 2</td>
                <td>Time 2</td>
                <td>Date 2</td>
                <td>
                  <button className="update-button">UPDATE</button>
                  <button className="delete-button">DELETE</button>
                </td>
              </tr>
              <tr>
                <td>Name 3</td>
                <td>Time 3</td>
                <td>Date 3</td>
                <td>
                  <button className="update-button">UPDATE</button>
                  <button className="delete-button">DELETE</button>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}

export default manage;
