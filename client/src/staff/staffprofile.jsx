import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import { FaBell, FaCheckCircle, FaClipboardCheck } from "react-icons/fa";
import axios from "axios";
import "./staffprofile.css";
import "./shared.css";

function StaffProfile() {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");
  
  // State declarations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    role: "Staff",
    picture: localStorage.getItem("userPicture") || "",
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const staffEmail = localStorage.getItem("userEmail");
      
      if (!staffEmail || !accessToken) {
        console.error("No access token or email found");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/notifications/staff",
        {
          params: { 
            staffEmail,
            role: "staff"
          },
          headers: { 
            Authorization: `Bearer ${accessToken}` 
          }
        }
      );

      setNotifications(response.data);
      const unread = response.data.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/notifications/${notificationId}`,
        { read: true },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Handle logout
  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    navigate("/");
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    if (!accessToken) {
      navigate("/");
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [accessToken, navigate]);

  if (loading && !userProfile.email) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="profile">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav>
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
                  <ul className="notification-list">
                    {notifications.map(notification => (
                      <li
                        key={notification._id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <p>{notification.message}</p>
                        <small>{new Date(notification.createdAt).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
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
          <button
            className="sidebar-btn"
            onClick={() => navigate("/voucher")}
          >
            Voucher
          </button>
          <button
            className="sidebar-btn"
            onClick={() => navigate("/staffTask")}
          >
            Task
          </button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout />
          </button>
        </aside>
        <main className="main-container">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-picture-large">
                {userProfile.picture ? (
                  <img src={userProfile.picture} alt="profile" />
                ) : (
                  <div className="profile-placeholder">👤</div>
                )}
              </div>
              <div className="profile-info">
                <h2>{userProfile.name}</h2>
                <p className="role">{userProfile.role}</p>
                <p className="email">{userProfile.email}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffProfile;
