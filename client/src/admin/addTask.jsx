import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MenuItem from "@mui/material/MenuItem";
import "./addTask.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import { FaBell } from 'react-icons/fa';
import dayjs from "dayjs"; // Import dayjs

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

const AddTask = () => {
  const navigate = useNavigate();

  // Sidebar navigation functions
  const handleStaffClick = () => navigate("/addStaff");
  const handleDashboardClick = () => navigate("/dashboard");
  const handleManageClick = () => navigate("/manage");

  // State Variables
  const [payeeName, setPayeeName] = useState("");
  const [staff, setStaff] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskFormValues, setTaskFormValues] = useState({
    payeeName: "",
    staff: "",
    date: "",
    time: "",
  });

  // Fetch tasks and staff list on component mount
  useEffect(() => {
    fetchTasks();
    fetchStaffList();
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

  const fetchStaffList = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/staff");
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/task");
      setTasks(response.data);

      // Show form if no tasks exist
      setIsAddingTask(response.data.length === 0);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Edit task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    // Convert the date string to a dayjs object
    const formattedDate = task.date ? dayjs(task.date) : null;
    const formattedTime = task.time ? dayjs(task.time, 'HH:mm') : null;
    
    setTaskFormValues({
      payeeName: task.payeeName,
      staff: task.staff,
      date: formattedDate,
      time: formattedTime,
    });
    setIsEditingTask(true);
  };

  // Update task
  const handleUpdateTask = async () => {
    try {
      const updatedTask = {
        payeeName: taskFormValues.payeeName,
        staff: taskFormValues.staff,
        date: taskFormValues.date ? taskFormValues.date.format('YYYY-MM-DD') : '',
        time: taskFormValues.time ? taskFormValues.time.format('HH:mm') : '',
      };

      await axios.patch(
        `http://localhost:8000/api/task/${selectedTask._id}`,
        updatedTask
      );
      fetchTasks();
      setIsEditingTask(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      alert("Are you sure you want to delete this task?");
      await axios.delete(`http://localhost:8000/api/task/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Submit new task
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedStaffMember = staffList.find((s) => s.email === staff);
    if (!selectedStaffMember) {
      alert("Please select a valid staff member");
      return;
    }

    const taskData = {
      payeeName: payeeName,
      staff: staff, // Using staff email as identifier
      date: date ? date.format("YYYY-MM-DD") : "",
      time: time ? time.format("HH:mm") : "",
    };

    try {
      await axios.post("http://localhost:8000/api/task", taskData);
      alert("Task added successfully!");
      fetchTasks(); // Refresh tasks
      setIsAddingTask(false); // Switch to table view
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
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
    <div className="AddTask">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="icon-button" onClick={() => navigate("/profile")}> {userProfile.picture ? (
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
          <button className="sidebar-btn" onClick={handleDashboardClick}>
            Dashboard
          </button>
          <button className="sidebar-btn" onClick={handleManageClick}>
            Manage
          </button>
          <button className="sidebar-btn">Task</button>
          <button className="sidebar-btn" onClick={handleStaffClick}>
            Staff
          </button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="log-icon" />
          </button>
        </aside>

        <main className="content">
          {isAddingTask ? (
            <>
              <h1 className="form-title">Add Task</h1>
              <div className="form-card">
                <form className="task-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <TextField
                      id="payee"
                      label="Payee Name"
                      variant="outlined"
                      required
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                    />
                    <TextField
                    style={{ width: '200px' }}
                      id="type"
                      select
                      label="Staff"
                      variant="outlined"
                      required
                      value={staff}
                      onChange={(e) => setStaff(e.target.value)}
                    >
                      {staffList.map((staffMember) => (
                        <MenuItem key={staffMember.email} value={staffMember.email}>
                          {staffMember.name} ({staffMember.position})
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                  <div className="form-row">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date"
                        value={date}
                        onChange={(newDate) => setDate(newDate)}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Time"
                        value={time}
                        onChange={(newTime) => setTime(newTime)}
                      />
                    </LocalizationProvider>
                  </div>
                  <button type="submit" className="add-btn">
                    Add Task
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="task-card">
              <button
                className="task-button"
                onClick={() => setIsAddingTask(true)}
              >
                Add
              </button>
              <h3>Tasks</h3>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Payee Name</th>
                    <th>Staff</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.payeeName}</td>
                      <td>{task.staff}</td>
                      <td>{new Date(task.date).toLocaleDateString()}</td>
                      <td>{task.time}</td>
                      <td>
                        <button onClick={() => handleEditTask(task)}>Edit</button>
                        <button

                          onClick={() => handleDeleteTask(task._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isEditingTask && (
            <div className="modal">
              <div className="modal-content">
                <h3>Edit Task</h3>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Payee Name"
                  value={taskFormValues.payeeName}
                  onChange={(e) =>
                    setTaskFormValues({
                      ...taskFormValues,
                      payeeName: e.target.value,
                    })
                  }
                />
                <TextField
                  fullWidth
                  margin="normal"
                  select
                  label="Staff"
                  value={taskFormValues.staff}
                  onChange={(e) =>
                    setTaskFormValues({
                      ...taskFormValues,
                      staff: e.target.value,
                    })
                  }
                >
                  {staffList.map((staffMember) => (
                    <MenuItem key={staffMember.email} value={staffMember.email}>
                      {staffMember.name} ({staffMember.position})
                    </MenuItem>
                  ))}
                </TextField>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    value={taskFormValues.date}
                    onChange={(newDate) =>
                      setTaskFormValues({
                        ...taskFormValues,
                        date: newDate,
                      })
                    }
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Time"
                    value={taskFormValues.time}
                    onChange={(newTime) =>
                      setTaskFormValues({
                        ...taskFormValues,
                        time: newTime,
                      })
                    }
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
                <div className="modal-buttons">
                <button
                    className="modal-button update"
                    onClick={handleUpdateTask}
                  >
                    Update Task
                  </button>
                  <button 
                    className="modal-button cancel"
                    onClick={() => {
                      setIsEditingTask(false);
                      setSelectedTask(null);
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
};

export default AddTask;
