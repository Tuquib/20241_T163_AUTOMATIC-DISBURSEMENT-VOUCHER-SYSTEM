import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";
import './dashboard.css';

// Import required chart components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register components with ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleTaskClick = () => {
    navigate("/addTask"); // Navigate to the Login route when button is clicked
  };

  const handleStaffClick = () => {
    navigate("/addStaff"); // Navigate to the Login route when button is clicked
  };

  const weeklyData = [
    { week: 'Week 1', count: 50 },
    { week: 'Week 2', count: 30 },
    { week: 'Week 3', count: 70 },
    { week: 'Week 4', count: 80 },
  ];

  const yearlyData = {
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
      'September', 'October', 'November', 'December'
    ],
    datasets: [
      {
        label: 'Vouchers',
        data: [10, 30, 50, 70, 100, 50, 40, 80, 60, 90, 110, 120],
        backgroundColor: 'teal',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
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
          color: 'rgba(200, 200, 200, 0.3)',
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
          <span className="sub2-text">Automated Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="logout-btn">Logout</button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
          <button className="sidebar-btn">Manage</button>
          <button className="sidebar-btn" onClick={handleTaskClick}>Add Task</button>
          <button className="sidebar-btn" onClick={handleStaffClick}>Add Staff</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <div className="stat-cards">
            <div className="stat-card">
              <h3>Total no. of Staffs</h3>
              <div className="stat-value">10</div>
            </div>
            <div className="stat-card">
              <h3>Needed Vouchers Today:</h3>
              <div className="voucher-list">
                <p>Voucher 1</p>
                <p>Voucher 2</p>
              </div>
            </div>
            <div className="stat-card">
              <h3>Number of Vouchers per Week</h3>
              {weeklyData.map((item, index) => (
                <p key={index}>{item.week}: {item.count}</p>
              ))}
            </div>
          </div>
          <div className="chart-section">
            <h3>Total no. of Voucher in a Year</h3>
            <div style={{ height: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              <Bar data={yearlyData} options={options} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
