import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout} from "react-icons/md";
import { FaGoogleDrive } from "react-icons/fa";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./staffDashboard.css";
import { FaBell} from 'react-icons/fa';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [weeklyData, setWeeklyData] = useState([
    { name: "Week 1", vouchers: 0 },
    { name: "Week 2", vouchers: 0 },
    { name: "Week 3", vouchers: 0 },
    { name: "Week 4", vouchers: 0 },
  ]);
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

  // Fetch vouchers for the table (staff-specific)
  useEffect(() => {
    const fetchVouchersForTable = async () => {
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
          _id: voucher._id,  
          name: `DV_${voucher.dvNumber}`,
          createdTime: new Date(voucher.createdTime),
          modifiedTime: new Date(voucher.modifiedTime).toLocaleDateString(),
          status: voucher.status,
          webViewLink: voucher.webViewLink,
          driveFileId: voucher.driveFileId
        }));

        setVouchers(formattedVouchers);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setError("Failed to load vouchers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchersForTable();
  }, []);

  // Fetch all vouchers for the chart (system-wide)
  useEffect(() => {
    const fetchVouchersForChart = async () => {
      try {
        // Set current month name
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        setCurrentMonth(monthName);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch all vouchers (no staffEmail filter)
        const response = await axios.get("http://localhost:8000/api/vouchers", {
          params: {
            isAdmin: true // This will fetch all vouchers without staff filter
          },
        });

        const allVouchers = response.data.map(voucher => ({
          ...voucher,
          createdTime: new Date(voucher.createdTime)
        }));

        // Filter vouchers for current month
        const currentMonthVouchers = allVouchers.filter(voucher => 
          voucher.createdTime >= startOfMonth && voucher.createdTime <= endOfMonth
        );

        // Group vouchers by week
        const weeklyVouchers = currentMonthVouchers.reduce((acc, voucher) => {
          const dayOfMonth = voucher.createdTime.getDate();
          let weekNumber;
          
          if (dayOfMonth <= 7) weekNumber = 0;
          else if (dayOfMonth <= 14) weekNumber = 1;
          else if (dayOfMonth <= 21) weekNumber = 2;
          else weekNumber = 3;
          
          acc[weekNumber] = (acc[weekNumber] || 0) + 1;
          return acc;
        }, {});

        // Update weekly data
        setWeeklyData([
          { name: "Week 1", vouchers: weeklyVouchers[0] || 0 },
          { name: "Week 2", vouchers: weeklyVouchers[1] || 0 },
          { name: "Week 3", vouchers: weeklyVouchers[2] || 0 },
          { name: "Week 4", vouchers: weeklyVouchers[3] || 0 },
        ]);

      } catch (err) {
        console.error("Error fetching vouchers for chart:", err);
      }
    };

    fetchVouchersForChart();
  }, []);

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

  const deleteVoucher = async (voucherId, fileId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const staffEmail = localStorage.getItem("userEmail");

      if (!accessToken || !staffEmail) {
        setError("Missing authentication information. Please log in again.");
        return;
      }

      // Confirm deletion
      if (!window.confirm("Are you sure you want to delete this voucher?")) {
        return;
      }

      await axios.delete(`http://localhost:8000/api/vouchers/${voucherId}`, {
        params: {
          fileId: fileId,
          staffEmail: staffEmail,
          accessToken: accessToken,
        },
      });

      // Remove the voucher from the local state
      setVouchers(vouchers.filter((v) => v._id !== voucherId));
    } catch (error) {
      console.error("Error deleting voucher:", error);
      setError("Failed to delete voucher. " + error.message);
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
          <button className="icon-button" onClick={() => navigate("/staffprofile")}>
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
          <button className="sidebar-btn">Dashboard</button>
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
          <div className="main-title">
            <h3>DASHBOARD</h3>
            <button
              className="create-voucher-btn"
              onClick={() => navigate("/staffTask")}
            >
              Create Voucher
            </button>
          </div>

          <div className="charts">
            <div className="chart-card">
              <h4>Weekly Summary - {currentMonth}</h4>
              {vouchers.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vouchers" fill="#0088FE" name="Vouchers Made" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-message">
                  <p>No data to display yet</p>
                </div>
              )}
            </div>
          </div>

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
                      <tr key={voucher._id}>
                        <td>{voucher.name}</td>
                        <td>{voucher.createdTime.toLocaleDateString()}</td>
                        <td>{voucher.modifiedTime}</td>
                        <td>
                          <span
                            className={`status-badge ${voucher.status.toLowerCase()}`}
                          >
                            {voucher.status}
                          </span>
                        </td>
                        <td>
                          {voucher.webViewLink && (
                            <button
                              className="view-drive-btn"
                              onClick={() => openInDrive(voucher.webViewLink)}
                            >
                              <FaGoogleDrive/>
                            </button>
                          )}
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
