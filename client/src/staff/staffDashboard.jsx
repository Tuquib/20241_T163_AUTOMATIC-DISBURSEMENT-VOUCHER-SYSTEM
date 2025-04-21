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
import { FaCheckCircle } from 'react-icons/fa';
import { FaClipboardCheck } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';

// Profile Image Component
const ProfileImage = ({ imageUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset states when URL changes
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  if (!imageUrl || imageError) {
    return <FaUserCircle size={40} color="#666" />;
  }

  return (
    <div style={{ width: '40px', height: '40px', position: 'relative' }}>
      <img
        src={imageUrl}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          display: imageLoaded ? 'block' : 'none'
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {!imageLoaded && !imageError && (
        <FaUserCircle size={40} color="#666" style={{ position: 'absolute', top: 0, left: 0 }} />
      )}
    </div>
  );
};

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
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");
  const [userProfile, setUserProfile] = useState({
    picture: '',
    name: '',
    email: ''
  });

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
        const accessToken = localStorage.getItem("access_token");

        if (!staffEmail || !accessToken) {
          setError("Please log in again");
          return;
        }

        console.log("Fetching vouchers with params:", { staffEmail }); // Debug log

        const response = await axios.get("http://localhost:8000/api/vouchers", {
          params: {
            staffEmail: staffEmail
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const formattedVouchers = response.data.map((voucher) => ({
          id: voucher.id,
          name: voucher.name || `DV_${voucher.dvNumber}`,
          createdTime: new Date(voucher.createdTime).toLocaleDateString(),
          modifiedTime: new Date(voucher.modifiedTime).toLocaleDateString(),
          status: voucher.status,
          webViewLink: voucher.webViewLink,
          driveFileId: voucher.driveFileId,
          dvNumber: voucher.dvNumber,
          fundCluster: voucher.fundCluster
        }));

        setVouchers(formattedVouchers);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setError("Failed to fetch vouchers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchersForTable();
  }, []);

  // Fetch vouchers for the chart (staff-specific)
  useEffect(() => {
    const fetchVouchersForChart = async () => {
      try {
        // Set current month name
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        setCurrentMonth(monthName);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const staffEmail = localStorage.getItem("userEmail");

        if (!staffEmail || !accessToken) {
          setError("Please log in again");
          return;
        }

        // Fetch staff-specific vouchers for the chart
        const response = await axios.get("http://localhost:8000/api/vouchers", {
          params: {
            staffEmail: staffEmail,
            isAdmin: false
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
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
      const staffEmail = localStorage.getItem('userEmail');
      if (!staffEmail || !accessToken) {
        console.error('No access token or email found');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/notifications/staff', {
        params: { staffEmail },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setNotifications(response.data);
      // Update unread count
      const unreadCount = response.data.filter(notif => !notif.read).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      if (!accessToken) {
        console.error('No access token found');
        return;
      }

      await axios.patch(`http://localhost:8000/api/notifications/mark-read/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      // Refresh notifications after marking as read
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
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
      const staffEmail = localStorage.getItem("userEmail");

      if (!staffEmail || !accessToken) {
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

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get user info from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userPicture = localStorage.getItem('userPicture');
        const userName = localStorage.getItem('userName');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        if (!userEmail) {
          console.error('No user information found');
          navigate('/');
          return;
        }

        // Debug logs
        console.log('Loading profile data:');
        console.log('Email:', userEmail);
        console.log('Name:', userName);
        console.log('Picture from localStorage:', userPicture);
        console.log('UserInfo:', userInfo);

        // Always try to get the latest profile data from the database
        try {
          console.log('Fetching profile from database for email:', userEmail);
          const response = await axios.get(`http://localhost:8000/api/staff/email/${userEmail}`);
          console.log('Database response:', response.data);
          
          if (response.data && response.data.picture) {
            console.log('Got picture from database:', response.data.picture);
            localStorage.setItem('userPicture', response.data.picture);
            localStorage.setItem('userInfo', JSON.stringify({
              email: response.data.email,
              name: response.data.name,
              picture: response.data.picture
            }));
            
            setUserProfile({
              picture: response.data.picture,
              name: response.data.name || userName,
              email: response.data.email || userEmail
            });
          } else {
            console.log('No picture found in database response');
            setUserProfile({
              picture: userPicture || userInfo.picture || '',
              name: userName || userInfo.name || '',
              email: userEmail || userInfo.email || ''
            });
          }
        } catch (error) {
          console.error('Error fetching profile from database:', error);
          setUserProfile({
            picture: userPicture || userInfo.picture || '',
            name: userName || userInfo.name || '',
            email: userEmail || userInfo.email || ''
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
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
          <button 
            className="icon-button" 
            onClick={() => navigate("/staffprofile")}
            style={{ 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            <ProfileImage imageUrl={userProfile.picture} />
          </button>
          <div className="notification-container">
            <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <span>{unreadNotifications} unread</span>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationAsRead(notification._id)}
                      >
                        <div className="notification-icon">
                          {notification.type === 'voucher_approved' ? (
                            <FaCheckCircle className="approved-icon" />
                          ) : (
                            <FaClipboardCheck className="task-icon" />
                          )}
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <small>{new Date(notification.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                      <tr key={voucher._id || voucher.id}>
                        <td>{voucher.name}</td>
                        <td>{voucher.createdTime}</td>
                        <td>{voucher.modifiedTime}</td>
                        <td>
                          <span
                            className={`status-badge ${voucher.status.toLowerCase()}`}
                          >
                            {voucher.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {voucher.webViewLink && (
                              <button
                                onClick={() => window.open(voucher.webViewLink, "_blank")}
                                className="view-btn"
                              >
                                <FaGoogleDrive />
                              </button>
                            )}
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
