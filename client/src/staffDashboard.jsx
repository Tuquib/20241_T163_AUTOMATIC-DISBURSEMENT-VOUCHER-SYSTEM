import React from "react";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { googleLogout } from "@react-oauth/google";

// Import required chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const clientId = "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleManageClick = () => {
    navigate("/manage"); // Navigate to the Manage route when button is clicked
  };

  const handleTaskClick = () => {
    navigate("/addTask"); // Navigate to the Login route when button is clicked
  };

  const handleStaffClick = () => {
    navigate("/addStaff"); // Navigate to the Login route when button is clicked
  };

  const handleLogout = () => {
    googleLogout();
    onSuccess();
    navigate("/");
  };

  // Monthly data instead of yearly data
  const monthlyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Vouchers",
        data: [50, 30, 70, 80],
        backgroundColor: "teal",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
        },
      },
    },
  };

  return (
    <div className="dashboard">
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
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
          <button className="sidebar-btn" onClick={handleManageClick}>
            Manage
          </button>
          <button className="sidebar-btn" onClick={handleTaskClick}>
            Add Task
          </button>
          <button className="sidebar-btn" onClick={handleStaffClick}>
            Add Staff
          </button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <div className="stat-cards">
            <div className="stat-card">
              <h3>Needed Vouchers Today:</h3>
              <div className="voucher-list">
                <p>Voucher 1</p>
                <p>Voucher 2</p>
              </div>
            </div>
          </div>
          <div className="chart-section">
            <h3>Monthly Summary of November</h3>
            <div
              style={{
                height: "300px",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <Bar data={monthlyData} options={options} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
