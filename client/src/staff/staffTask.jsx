import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./staffTask.css";
import { googleLogout } from "@react-oauth/google";
import axios from "axios";
import { MdOutlineLogout } from "react-icons/md";
import { FaBell } from "react-icons/fa";

function StaffTask() {
  const navigate = useNavigate();
  
  // All state declarations
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState({
    picture: "",
  });

  // Fetch notifications function
  const fetchNotifications = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const staffEmail = localStorage.getItem("userEmail");

      if (!accessToken || !staffEmail) {
        console.error("No access token or email found");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/notifications",
        {
          params: {
            staffEmail,
            role: "staff",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotifications(response.data);
      const unread = response.data.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to fetch notifications");
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.patch(
        `http://localhost:8000/api/notifications/${notificationId}`,
        { read: true },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      notifications.forEach((notif) => {
        if (!notif.read) {
          markAsRead(notif._id);
        }
      });
    }
  };

  const handleCreateVoucher = (taskId) => {
    navigate(`/createVoucher/${taskId}`);
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    navigate("/");
  };

  // Effect for user profile
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userPicture = localStorage.getItem("userPicture");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userEmail) {
      console.error("No user information found");
      navigate("/");
      return;
    }

    setUserProfile({
      picture: userPicture || userInfo.picture || null,
    });
  }, [navigate]);

  // Effect for tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const staffEmail = localStorage.getItem("userEmail");

        if (!staffEmail) {
          setError("No staff email found. Please log in again.");
          navigate("/");
          return;
        }

        const staffResponse = await axios.get(
          `http://localhost:8000/api/staff/email/${staffEmail}`
        );
        const staff = staffResponse.data;

        const tasksResponse = await axios.get(
          `http://localhost:8000/api/task/staff/${staffEmail}`
        );
        setTasks(tasksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError("Error loading tasks. Please try again.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  // Effect for notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <p>Loading tasks...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Return to Login</button>
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
          <button className="icon-button">
            {userProfile.picture ? (
              <img
                src={userProfile.picture}
                alt="profile"
                className="profile-picture"
              />
            ) : (
              "👤"
            )}
          </button>
          <div className="notification-container">
            <button className="notification-button" onClick={toggleNotifications}>
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-panel">
                <h3>Notifications</h3>
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        notification.read ? "read" : "unread"
                      }`}
                      onClick={() => markAsRead(notification._id)}
                    >
                      <p>{notification.message}</p>
                      <small>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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
                    <th>Payee Name</th>
                    <th>Staff</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.payeeName}</td>
                      <td>{task.staff}</td>
                      <td>{new Date(task.date).toLocaleDateString()}</td>
                      <td>{task.time}</td>
                      <td>
                        <button
                          style={{ backgroundColor: "#1a73e8", color: "white" }}
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
