import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./staffTask.css";
import { googleLogout } from "@react-oauth/google";
import axios from "axios";
import { MdOutlineLogout } from "react-icons/md";

function StaffTask() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Get staff email from localStorage
        const staffEmail = localStorage.getItem('userEmail');
        
        if (!staffEmail) {
          setError('No staff email found. Please log in again.');
          navigate('/');
          return;
        }

        // First get staff details
        const staffResponse = await axios.get(`http://localhost:8000/api/staff/email/${staffEmail}`);
        const staff = staffResponse.data;

        // Then get tasks for this staff
        const tasksResponse = await axios.get(`http://localhost:8000/api/task/staff/${staffEmail}`);
        setTasks(tasksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError('Error loading tasks. Please try again.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleCreateVoucher = (taskId) => {
    navigate(`/createVoucher/${taskId}`);
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    navigate("/");
  };

  if (loading) return (
    <div className="loading-container">
      <p>Loading tasks...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => navigate('/')}>Return to Login</button>
    </div>
  );

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
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button
            className="sidebar-btn"
            onClick={() => navigate("/staffDashboard")}
          >
            Dashboard
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/voucher")}>
            Voucher
          </button>
          <button className="sidebar-btn active">Task</button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="log-icon" />
          </button>
        </aside>
        <main className="taskcon">
          <div className="task-card">
            <h3>Your Tasks</h3>
            {tasks.length === 0 ? (
              <p>No tasks assigned yet.</p>
            ) : (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Entity Name</th>
                    <th>Staff</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.entityName}</td>
                      <td>{task.staff}</td>
                      <td>{new Date(task.date).toLocaleDateString()}</td>
                      <td>{task.time}</td>
                      <td>
                        <button style={{ backgroundColor: "#1a73e8", color: "white" }}

                          onClick={() => handleCreateVoucher(task._id)}
                        >
                          Create
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffTask;
