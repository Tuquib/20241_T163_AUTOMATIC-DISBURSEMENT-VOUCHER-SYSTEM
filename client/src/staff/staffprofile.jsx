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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    role: "Staff",
    picture: localStorage.getItem("userPicture") || "",
    position: "",
    contactNumber: ""
  });

  // Fetch staff profile
  const fetchStaffProfile = async () => {
    try {
      const staffEmail = localStorage.getItem("userEmail");
      
      if (!staffEmail || !accessToken) {
        console.error("No access token or email found");
        return;
      }

      console.log("Fetching staff profile for:", staffEmail);

      const response = await axios.get(
        `http://localhost:8000/api/staff/email/${staffEmail}`,
        {
          headers: { 
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.data) {
        console.log("Staff data received:", response.data);
        const staffData = response.data;

        setUserProfile(prev => ({
          ...prev,
          ...staffData,
          role: "Staff"
        }));

        // Update localStorage with new data
        localStorage.setItem('userName', staffData.name);
        localStorage.setItem('userPicture', staffData.picture);
        localStorage.setItem('userInfo', JSON.stringify(staffData));

        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setUserProfile(prev => ({
        ...prev,
        picture: previewUrl
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let pictureUrl = userProfile.picture;

      // If a file was selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
          const uploadResponse = await axios.post(
            'http://localhost:8000/api/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          pictureUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          alert('Failed to upload profile picture. Please try again.');
          return;
        }
      }

      // Update staff details
      const staffResponse = await axios.put(
        `http://localhost:8000/api/staff/update/${userProfile.email}`,
        {
          name: userProfile.name,
          email: userProfile.email,
          picture: pictureUrl,
          position: userProfile.position,
          contactNumber: userProfile.contactNumber
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (staffResponse.data) {
        // Update local storage
        localStorage.setItem('userName', staffResponse.data.name);
        localStorage.setItem('userPicture', staffResponse.data.picture);
        localStorage.setItem('userInfo', JSON.stringify(staffResponse.data));

        // Update state
        setUserProfile(prev => ({
          ...prev,
          ...staffResponse.data
        }));

        setIsEditing(false);
        setSelectedFile(null);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

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

  // Handle edit click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    // Reset any changes made to the profile
    fetchStaffProfile();
  };

  // Handle logout
  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    navigate("/");
  };

  // Fetch data on mount
  useEffect(() => {
    if (!accessToken) {
      navigate("/");
      return;
    }

    fetchStaffProfile();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

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
              {!isEditing ? (
                <div className="profile-info">
                  <h2>{userProfile.name}</h2>
                  <p className="role">{userProfile.role}</p>
                  <p className="position"style={{color: "#666"}}>{userProfile.position || 'No position set'}</p>
                  <p className="email">{userProfile.email}</p>
                  <p className="contact" style={{color: "#666"}}>{userProfile.contactNumber || 'No contact number set'}</p>
                  <button className="edit-profile-btn" onClick={handleEditClick}>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="profile-edit-form">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={userProfile.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Position:</label>
                      <input
                        type="text"
                        name="position"
                        value={userProfile.position || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Number:</label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={userProfile.contactNumber || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Profile Picture:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="save-btn">Save Changes</button>
                      <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffProfile;
