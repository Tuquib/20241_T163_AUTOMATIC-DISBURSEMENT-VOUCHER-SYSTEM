import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./staffTask.css";
import { googleLogout } from "@react-oauth/google";
import axios from "axios"; // For API calls

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function StaffTask() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch task data from the backend
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/task"); // Replace with your actual API endpoint
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const handleLogout = () => {
    googleLogout();
    onSuccess();
    navigate("/");
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/api/task/${taskId}`); // Replace with your actual delete endpoint
      setTasks(tasks.filter((task) => task._id !== taskId)); // Remove deleted task from the list
    } catch (error) {
      console.error("Error deleting task:", error);
    }
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
          <button className="logout-btn" onClick={handleLogout}> Logout </button>
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
          <button className="sidebar-btn">Voucher</button>
          <button className="sidebar-btn">Task</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="taskcon">
          <div className="task-card">
            <h3>Your Tasks</h3>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Payee Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Map through your task data to render rows */}
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.payeeName}</td>
                    <td>{task.type}</td>
                    <td>{task.date}</td>
                    <td>{task.time}</td>
                    <td>
                      <button onClick={() => handleDelete(task._id)}>
                        Create
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffTask;
