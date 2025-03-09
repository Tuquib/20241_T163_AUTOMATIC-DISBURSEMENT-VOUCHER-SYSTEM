import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import { FaBell } from 'react-icons/fa';

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Profile() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    picture: ''
  });

  useEffect(() => {
    // Get user info from localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userPicture = localStorage.getItem('userPicture');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (!userEmail) {
      console.error('No user information found');
      navigate('/');
      return;
    }

    setUserProfile({
      name: userName || userInfo.name || 'User',
      email: userEmail,
      role: userRole || 'admin',
      picture: userPicture || userInfo.picture || null
    });
  }, [navigate]);

  const handleManageClick = () => {
    navigate("/manage"); // Navigate to the Manage route when button is clicked
  };

  const handleDashboardClick = () => {
    navigate("/dashboard"); // Navigate to the Task route when button is clicked
  };

  const handleTaskClick = () => {
    navigate("/addTask"); // Navigate to the Task route when button is clicked
  };

  const handleStaffClick = () => {
    navigate("/addStaff"); // Navigate to the Staff route when button is clicked
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the Profile route when button is clicked
  };

  const handleLogout = () => {
    googleLogout();
    onSuccess();
    // Clear all localStorage items
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const userEmail = localStorage.getItem('userEmail');

        if (!accessToken || !userEmail) {
          console.error('No access token or email found');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/notifications', {
          params: { 
            staffEmail: userEmail,
            role: 'admin'  // Specify role as admin
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        setNotifications(response.data);
        // Count unread notifications
        const unread = response.data.filter(notif => !notif.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to fetch notifications');
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/notifications/${id}`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening the panel
      notifications.forEach(notif => {
        if (!notif.isRead) {
          markAsRead(notif._id);
        }
      });
    }
  };

  return (
    <div className="profile">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="icon-button" onClick={handleProfileClick}>
            {userProfile.picture ? (
              <img src={userProfile.picture} alt="profile" className="profile-picture" />
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
          <button className="sidebar-btn" onClick={handleDashboardClick}>Dashboard</button>
          <button className="sidebar-btn" onClick={handleManageClick}>
            Manage
          </button>
          <button className="sidebar-btn" onClick={handleTaskClick}>
            Task
          </button>
          <button className="sidebar-btn" onClick={handleStaffClick}>
            Staff
          </button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="logout-icon" />
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

export default Profile;
