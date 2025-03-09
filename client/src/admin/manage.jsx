import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./manage.css";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout, MdDelete } from "react-icons/md";
import { FaGoogleDrive } from "react-icons/fa";
import { FaBell } from 'react-icons/fa';

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Manage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
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

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        navigate('/');
        return;
      }
      fetchVouchers();
    };

    checkAuth();
  }, [navigate]);

  const fetchVouchers = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error('No access token found');
        return;
      }

      const response = await axios.get("http://localhost:8000/api/vouchers", {
        params: { 
          accessToken,
          isAdmin: true
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log("Raw voucher data:", response.data);
      
      // Format the vouchers data consistently
      const formattedVouchers = response.data.map(voucher => {
        const voucherId = voucher._id || voucher.id;
        console.log("Processing voucher:", { ...voucher, _id: voucherId });
        
        return {
          _id: voucherId,
          id: voucherId,
          name: voucher.name || `DV_${voucher.dvNumber || 'Unknown'}`,
          createdTime: voucher.createdTime || new Date().toISOString(),
          modifiedTime: voucher.modifiedTime || new Date().toISOString(),
          status: voucher.status ? voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1) : 'Pending', 
          webViewLink: voucher.webViewLink || '#',
          driveFileId: voucher.driveFileId,
          staffName: voucher.staffName,
          staffEmail: voucher.staffEmail,
          dvNumber: voucher.dvNumber
        };
      });
      
      console.log("Formatted vouchers:", formattedVouchers);
      setVouchers(formattedVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setError("Failed to fetch vouchers. Please try again.");
    }
  };

  const handleDeleteVoucher = async (voucherId, driveFileId) => {
    try {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.error("Access token is missing");
        return;
      }

      // Add confirmation dialog
      if (!window.confirm('Are you sure you want to delete this voucher? This action cannot be undone.')) {
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Deleting voucher:', { voucherId, driveFileId, hasAccessToken: !!accessToken });

      const response = await axios.delete(
        `http://localhost:8000/api/vouchers/${voucherId}`,
        {
          params: {
            accessToken,
            fileId: driveFileId,
            isAdmin: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 200) {
        // Update the UI immediately using the current state
        setVouchers(prevVouchers => prevVouchers.filter(voucher => voucher._id !== voucherId));
        console.log("Voucher deleted successfully:", response.data);
      }
    } catch (error) {
      console.error("Error deleting voucher:", error.response?.data || error.message);
      setError("Failed to delete voucher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVoucher = async (voucherId) => {
    try {
      if (!voucherId) {
        console.error("Invalid voucher ID:", voucherId);
        setError("Cannot approve voucher: Invalid ID");
        return;
      }

      console.log("Approving voucher with ID:", voucherId);
      
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.patch(
        `http://localhost:8000/api/vouchers/${voucherId}/status`,
        { status: 'Approved' }, 
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Approval response:", response.data);
      
      if (response.data.voucher) {
        // Update the local state first
        setVouchers(prevVouchers => 
          prevVouchers.map(voucher => 
            voucher._id === voucherId 
              ? { ...voucher, status: response.data.voucher.status } 
              : voucher
          )
        );
        
        // Then refresh to ensure we have the latest data
        await fetchVouchers();
      }
    } catch (error) {
      console.error('Error approving voucher:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to approve voucher. Please try again.');
    }
  };

  const handleLogout = () => {
    googleLogout();
    onSuccess();
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
    <div className="manage">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="icon-button"  onClick={() => navigate("/profile")}> {userProfile.picture ? (
              <img src={userProfile.picture} alt="profile" className="profile-picture" />
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
          <button
            className="sidebar-btn"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/manage")}>
            Manage
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/addTask")}>
            Task
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/addStaff")}>
            Staff
          </button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="log-icon" />
          </button>
        </aside>
        <main className="managecon">
          {/* Vouchers Section */}
          <div className="section-container">
            <h2>Manage Vouchers</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Modified</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((voucher) => (
                    <tr key={voucher._id}>
                      <td>{voucher.name}</td>
                      <td>{new Date(voucher.createdTime).toLocaleDateString()}</td>
                      <td>{new Date(voucher.modifiedTime).toLocaleDateString()}</td>
                      <td data-status={voucher.status}>{voucher.status}</td>
                      <td>
                        <div className="action-buttons">
                          {voucher.webViewLink && (
                            <button
                              className="view-btn"
                              onClick={() => window.open(voucher.webViewLink, '_blank')}
                            >
                              <FaGoogleDrive/>
                            </button>
                          )}
                          {voucher.status !== 'Approved' && voucher._id && (
                            <button
                              className="approve-button"
                              onClick={() => handleApproveVoucher(voucher._id)}
                            >
                              Approve
                            </button>
                          )}
                          {voucher._id && (
                            <button
                              onClick={() => handleDeleteVoucher(voucher._id, voucher.driveFileId)}
                              className="delete-btn"
                            >
                              <MdDelete/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Manage;
