import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import { FaBell } from 'react-icons/fa';
import "./addStaff.css";
import axios from "axios";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Staff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    contactNumber: "",
    email: "",
  });

  const [staffFormValues, setStaffFormValues] = useState({
    name: "",
    position: "",
    email: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

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

  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/staff");
      setStaff(response.data);

      // Show form if no Staff exist
      setIsAddingStaff(response.data.length === 0);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  // Staff Edit/Delete
  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setStaffFormValues({
      name: staff.name,
      position: staff.position,
      email: staff.email,
      contactNumber: staff.contactNumber,
    });
    setIsEditingStaff(true);
  };

  const handleUpdateStaff = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/staff/${selectedStaff._id}`,
        staffFormValues
      );
      fetchStaff();
      setIsEditingStaff(false);
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      alert("Are you sure you want to delete this staff?");
      await axios.delete(`http://localhost:8000/api/staff/${staffId}`);
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const staffData = {
      name: formData.name,
      position: formData.position,
      contactNumber: parseInt(formData.contactNumber),
      email: formData.email,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/api/staff",
        staffData
      );
      console.log("Staff added:", response.data);

      if (response.data.temporaryPassword) {
        alert(
          `Staff added successfully!\nTemporary password: ${response.data.temporaryPassword}\nPlease share this with the staff member securely.`
        );
      } else {
        alert("Staff added successfully!");
      }

      // Fetch updated staff list
      await fetchStaff();

      // Reset form
      setFormData({ name: "", position: "", contactNumber: "", email: "" });

      // Switch to table view
      setIsAddingStaff(false);
    } catch (error) {
      console.error("Error adding staff:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("Failed to add staff. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    googleLogout();
    onSuccess();
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
    <div className="App">
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
          <button className="sidebar-btn">Staff</button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="log-icon" />
          </button>
        </aside>
        <main className="content">
          {isAddingStaff ? (
            <>
              <h1 className="form-title">Add Staff</h1>
              <div className="form-card">
                <form className="staff-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <TextField
                      label="Name"
                      variant="standard"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <TextField
                      label="Position"
                      variant="standard"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <TextField
                      label="Contact Number"
                      variant="standard"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                      type="number"
                    />
                    <TextField
                      label="Email"
                      variant="standard"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      type="email"
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Add Staff
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="staff-card">
                <button
                  className="staff-button"
                  onClick={() => setIsAddingStaff(true)}
                >
                  Add
                </button>
                <h3>Staff</h3>
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member._id}>
                        <td>{member.name}</td>
                        <td>{member.position}</td>
                        <td>{member.email}</td>
                        <td>{member.contactNumber}</td>
                        <td>
                          <button onClick={() => handleEditStaff(member)}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteStaff(member._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {isEditingStaff && (
            <div className="modal">
              <div className="modal-content">
                <h3>Edit Staff</h3>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  value={staffFormValues.name}
                  onChange={(e) =>
                    setStaffFormValues({
                      ...staffFormValues,
                      name: e.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Position"
                  value={staffFormValues.position}
                  onChange={(e) =>
                    setStaffFormValues({
                      ...staffFormValues,
                      position: e.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  type="email"
                  value={staffFormValues.email}
                  onChange={(e) =>
                    setStaffFormValues({
                      ...staffFormValues,
                      email: e.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Contact Number"
                  value={staffFormValues.contactNumber}
                  onChange={(e) =>
                    setStaffFormValues({
                      ...staffFormValues,
                      contactNumber: e.target.value,
                    })
                  }
                />
                <div className="modal-buttons">
                <button
                    className="modal-button update"
                    onClick={handleUpdateStaff}
                  >
                    Update Staff
                  </button>
                  <button 
                    className="modal-button cancel"
                    onClick={() => {
                      setIsEditingStaff(false);
                      setSelectedStaff(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Staff;
