import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
} from "react-icons/bs";
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
import { FaBell, FaFileInvoiceDollar, FaUserCircle } from 'react-icons/fa';

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

// Separate component for Profile Image
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
          display: imageLoaded ? 'block' : 'none',
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
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    picture: '',
    name: '',
    email: ''
  });

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

        console.log('Profile picture URL:', userPicture || userInfo.picture);
        console.log('User Info:', userInfo);

        // Set the profile information
    setUserProfile({
          picture: userPicture || userInfo.picture || '',
          name: userName || userInfo.name || '',
          email: userEmail || userInfo.email || ''
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleManageClick = () => {
    navigate("/manage");
  };

  const handleTaskClick = () => {
    navigate("/addTask");
  };

  const handleStaffClick = () => {
    navigate("/addStaff");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.clear();
    googleLogout();
    onSuccess();
    navigate("/");
  };

  const [staffCount, setStaffCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch staff data and calculate the count
    const fetchStaffCount = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/staff");
        setStaffCount(response.data.length);
      } catch (error) {
        console.error("Error fetching staff count:", error);
      }
    };

    fetchStaffCount();
  }, []);

  useEffect(() => {
    // Fetch task and voucher data for the graph
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.error('No access token found');
          return;
        }

        // Fetch tasks
        const taskResponse = await axios.get("http://localhost:8000/api/task", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const tasks = taskResponse.data;
        setTaskCount(tasks.length);

        // Fetch vouchers
        const voucherResponse = await axios.get("http://localhost:8000/api/vouchers", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const vouchers = voucherResponse.data;
        setVoucherCount(vouchers.length);

        // Create a map to store data by date
        const dataByDate = {};

        // Process tasks
        tasks.forEach(task => {
          const date = new Date(task.date).toLocaleDateString();
          if (!dataByDate[date]) {
            dataByDate[date] = { need: 0, made: 0 };
          }
          dataByDate[date].need++;
        });

        // Process vouchers
        vouchers.forEach(voucher => {
          const date = new Date(voucher.createdTime).toLocaleDateString();
          if (!dataByDate[date]) {
            dataByDate[date] = { need: 0, made: 0 };
          }
          dataByDate[date].made++;
        });

        // Convert to array format for the graph
        const graphData = Object.keys(dataByDate)
          .sort((a, b) => new Date(a) - new Date(b))
          .map(date => ({
            name: date,
            need: dataByDate[date].need,
            made: dataByDate[date].made
          }));

        setGraphData(graphData);
      } catch (error) {
        console.error("Error fetching data for graph:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/admin/notifications', {
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
      const accessToken = localStorage.getItem('access_token');
      const userEmail = localStorage.getItem('userEmail');

      if (!accessToken || !userEmail) {
        console.error('No access token or email found');
        return;
      }

      await axios.patch(
        `http://localhost:8000/api/notifications/admin/${notificationId}/read`,
        { adminEmail: userEmail },
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
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Notification dropdown content
  const renderNotificationContent = () => (
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
                <FaFileInvoiceDollar className="voucher-icon" />
              </div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <small>
                  From: {notification.sourceStaffEmail}<br/>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  useEffect(() => {
    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
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
          <button 
            className="icon-button" 
            onClick={handleProfileClick}
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
            {showNotifications && renderNotificationContent()}
          </div>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
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
          <div className="main-title">
            <h3>DASHBOARD</h3>
          </div>
          <div className="main-cards">
            <div className="card">
              <div className="card-inner">
                <h3>Staff</h3>
                <BsPeopleFill className="card_icon" />
              </div>
              <h1>{staffCount}</h1>
            </div>
            <div className="card">
              <div className="card-inner">
                <h3>Vouchers Made</h3>
                <BsFillGrid3X3GapFill className="card_icon" />
              </div>
              <h1>{voucherCount}</h1>
            </div>
            <div className="card">
              <div className="card-inner">
                <h3>Vouchers Task</h3>
                <BsFillArchiveFill className="card_icon" />
              </div>
              <h1>{taskCount}</h1>
            </div>
          </div>
          <div className="charts">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={graphData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="made" fill="#FF6D00" name="Vouchers Made" />
                <Bar dataKey="need" fill="#82ca9d" name="Tasks Needed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
