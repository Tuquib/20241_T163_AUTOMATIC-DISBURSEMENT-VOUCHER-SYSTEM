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
import { FaBell } from 'react-icons/fa';

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [userProfile, setUserProfile] = useState({
    picture: ''
  });

  useEffect(() => {
    // Get user info from localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userPicture = localStorage.getItem('userPicture');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (!userEmail) {
      console.error('No user information found');
      navigate('/');
      return;
    }

    setUserProfile({
      picture: userPicture || userInfo.picture || null
    });
  }, [navigate]);

  const handleManageClick = () => {
    navigate("/manage"); // Navigate to the Manage route when button is clicked
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
    navigate("/");
  };

  const [staffCount, setStaffCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
        // Fetch tasks
        const taskResponse = await axios.get("http://localhost:8000/api/task");
        const tasks = taskResponse.data;
        setTaskCount(tasks.length);

        // Fetch vouchers
        const voucherResponse = await axios.get("http://localhost:8000/api/vouchers");
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
    <div className="dashboard">
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
          <div className="notification-icon" onClick={toggleNotifications}>
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
          {showNotifications && (
            <div className="notification-dropdown">
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                ))
              ) : (
                <div className="notification-item">No notifications</div>
              )}
            </div>
          )}
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
          <br /> <br />
          <br />
          <br />
          <br />
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
