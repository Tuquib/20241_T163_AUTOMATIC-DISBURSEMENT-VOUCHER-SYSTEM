import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout, MdDelete } from "react-icons/md";
import { FaGoogleDrive } from "react-icons/fa";
import axios from "axios";
import "./staffDashboard.css";
import { FaBell} from 'react-icons/fa';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const handleCreateVoucher = () => {
    const staffEmail = localStorage.getItem("userEmail");
    const staffName = localStorage.getItem("userName");
    if (!staffEmail || !staffName) {
      setError("Missing staff information. Please log in again.");
      return;
    }
    navigate("/voucher", {
      state: {
        staffEmail,
        staffName,
      },
    });
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError(null);
        const staffEmail = localStorage.getItem("userEmail");

        const response = await axios.get("http://localhost:8000/api/vouchers", {
          params: {
            staffEmail: staffEmail,
          },
        });

        const formattedVouchers = response.data.map((voucher) => ({
          id: voucher.id,
          name: voucher.name,
          createdTime: new Date(voucher.createdTime).toLocaleDateString(),
          modifiedTime: new Date(voucher.modifiedTime).toLocaleDateString(),
          status: voucher.status,
          webViewLink: voucher.webViewLink,
          driveFileId: voucher.driveFileId,
        }));

        setVouchers(formattedVouchers);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setError("Failed to load vouchers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const openInDrive = (webViewLink) => {
    window.open(webViewLink, "_blank");
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("googleToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleDeleteVoucher = async (voucherId, fileId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this voucher?");
    if (!confirmDelete) return;

    try {
      const staffEmail = localStorage.getItem("userEmail");
      const accessToken = localStorage.getItem("access_token");

      if (!voucherId || !staffEmail || !accessToken) {
        console.error("Missing required information for deletion");
        alert("Missing required information. Please log in again.");
        return;
      }

      setLoading(true); // Show loading state
      setError(null); // Clear any previous errors

      console.log('Deleting voucher:', { voucherId, fileId, staffEmail, hasAccessToken: !!accessToken });

      const response = await axios.delete(
        `http://localhost:8000/api/vouchers/${voucherId}`,
        {
          params: {
            fileId,
            staffEmail,
            accessToken
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 200) {
        // Update the UI immediately using functional update
        setVouchers(currentVouchers => 
          currentVouchers.filter(voucher => voucher.id !== voucherId)
        );
        console.log("Voucher deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting voucher:", error);
      setError(error.response?.data?.message || "Failed to delete voucher. Please try again.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const [userProfile, setUserProfile] = useState({
    picture: "",
  });

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
      setError('Failed to fetch notifications');
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
    <div className="dashboard">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="icon-button" onClick={() => navigate("/staffprofile")}>{userProfile.picture ? (
                <img
                  src={userProfile.picture}
                  alt="profile"
                  className="profile-picture"
                />
              ) : (
                "👤"
              )}</button>
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
          <button className="sidebar-btn" onClick={() => navigate("/staffDashboard")}>Dashboard</button>
          <button className="sidebar-btn" onClick={() => navigate("/voucher")}>
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
            <MdOutlineLogout className="logout-icon" />
          </button>
        </aside>
        <main className="main-container">
          {error && <div className="error-message">{error}</div>}
          <div className="vouchers-table-container">
            <h4>Your Vouchers</h4>
            {loading ? (
              <div className="loading-message">Loading vouchers...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : vouchers.length === 0 ? (
              <div className="no-vouchers-message">
                <p>You haven't created any vouchers yet.</p>
                <button
                  className="create-first-voucher"
                  onClick={handleCreateVoucher}
                >
                  Create Your First Voucher
                </button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="vouchers-table">
                  <thead>
                    <tr>
                      <th>Voucher Name</th>
                      <th>Created Date</th>
                      <th>Last Modified</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id}>
                        <td>{voucher.name}</td>
                        <td>{voucher.createdTime}</td>
                        <td>{voucher.modifiedTime}</td>
                        <td>
                          <span className={`status-badge ${voucher.status}`}>
                            {voucher.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() => window.open(voucher.webViewLink, '_blank')}
                            >
                              <FaGoogleDrive />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteVoucher(voucher.id)}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
