import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { googleLogout } from "@react-oauth/google";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

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

  const weeklyData = [
    { week: "Week 1", count: 50 },
    { week: "Week 2", count: 30 },
    { week: "Week 3", count: 70 },
    { week: "Week 4", count: 80 },
  ];

  const yearlyData = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Vouchers",
        data: [10, 30, 50, 70, 100, 50, 40, 80, 60, 90, 110, 120],
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

  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    // Fetch staff data and calculate the count
    const fetchStaffCount = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/staff");
        setStaffCount(response.data.length); // Set the count based on the data length
      } catch (error) {
        console.error("Error fetching staff count:", error);
      }
    };

    fetchStaffCount();
  }, []);

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
            Task
          </button>
          <button className="sidebar-btn" onClick={handleStaffClick}>
            Staff
          </button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <div className="stat-cards">
            <div className="stat-card">
              <h3>Total no. of Staffs</h3>
              <div className="stat-value">{staffCount}</div>
            </div>
            <div className="stat-card">
              <h3>Needed Vouchers Today:</h3>
              <div className="voucher-list">
                <p>Voucher 1</p>
                <p>Voucher 2</p>
                <p>Voucher 3</p>
                <p>Voucher 4</p>
              </div>
            </div>
            <div className="stat-card">
              <h3>Number of Vouchers per Week</h3>
              {weeklyData.map((item, index) => (
                <p key={index}>
                  {item.week}: {item.count}
                </p>
              ))}
            </div>
          </div>
          <br /> <br /> <br /> <br /> <br />
          <div className="chart-section">
            <h3>Total no. of Voucher in a Year</h3>
            <div
              style={{
                height: "300px",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <Bar data={yearlyData} options={options} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
