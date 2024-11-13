import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./addTask.css";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API calls

const AddTask = () => {
  const navigate = useNavigate();

  // Navigate functions for sidebar buttons
  const handleStaffClick = () => {
    navigate("/addStaff");
  };
  const handleLogoutClick = () => {
    // You may need to add googleLogout or similar logout logic here
    console.log("Logout Successfully!");
    navigate("/");
  };
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };
  const handleManageClick = () => {
    navigate("/manage");
  };

  const [payeeName, setPayeeName] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState(null); // Will store the selected date
  const [time, setTime] = useState(null); // Will store the selected time

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      payeeName: payeeName,
      type: type,
      date: date ? date.format("YYYY-MM-DD") : "", // Format date to string
      time: time ? time.format("HH:mm") : "", // Format time to string
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/api/task",
        taskData
      );
      console.log("Task added:", response.data);
      alert("Task added successfully!");
      navigate("/dashboard"); // Redirect after success
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
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
          <button className="icon-button">👤</button>
          <button className="icon-button">🔔</button>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
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
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <h1 className="form-title">Add Task</h1>
          <div className="form-card">
            <form className="task-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <TextField
                  className="payee"
                  id="payee"
                  label="Payee Name"
                  variant="outlined"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                />
                <TextField
                  className="type"
                  id="type"
                  label="Type"
                  variant="outlined"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>
              <div className="form-row">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    value={date}
                    onChange={(newDate) => setDate(newDate)} // Track date change
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Time"
                    value={time}
                    onChange={(newTime) => setTime(newTime)} // Track time change
                  />
                </LocalizationProvider>
              </div>
              <button type="submit" className="add-btn">
                Send
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddTask;
