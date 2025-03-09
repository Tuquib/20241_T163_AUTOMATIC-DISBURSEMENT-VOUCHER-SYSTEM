import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./staffprofile.css";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import { FaBell} from 'react-icons/fa';
import axios from "axios";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function StaffProfile() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    role: "",
    picture: "",
  });

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");
    const userPicture = localStorage.getItem("userPicture");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userEmail) {
      console.error("No user information found");
      navigate("/");
      return;
    }

    setUserProfile({
      name: userName || userInfo.name || "User",
      email: userEmail,
      role: userRole || "staff",
      picture: userPicture || userInfo.picture || "User",
    });
  }, [navigate]);

  const handleVoucherClick = () => {
    navigate("/voucher");
  };

  const handleDashboardClick = () => {
    navigate("/staffDashboard");
  };

  const handleTaskClick = () => {
    navigate("/staffTask");
  };

  const handleProfileClick = () => {
    navigate("/staffProfile");
  };

  const handleLogout = () => {
    googleLogout();
    onSuccess();
    localStorage.clear();
    navigate("/");
  };

   // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const staffEmail = localStorage.getItem('userEmail');

      if (!accessToken || !staffEmail) {
        console.error('No access token or email found');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/notifications', {
        params: { 
          staffEmail,
          role: 'staff'  // Specify role as staff
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
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.patch(
        `http://localhost:8000/api/notifications/${notificationId}`,
        { read: true },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
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
      console.error('Error marking notification as read:', error);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening the panel
      notifications.forEach(notif => {
        if (!notif.read) {
          markAsRead(notif._id);
        }
      });
    }
  };

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
            <button className="icon-button" onClick={handleProfileClick}>
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
            <button className="sidebar-btn" onClick={handleDashboardClick}>
              Dashboard
            </button>
            <button className="sidebar-btn" onClick={handleVoucherClick}>
              Voucher
            </button>
            <button className="sidebar-btn" onClick={handleTaskClick}>
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
