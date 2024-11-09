import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "./addStaff.css";
import axios from "axios";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Staff() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    contactNumber: "",
    email: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert contactNumber to integer
    const staffData = {
      name: formData.name, // Accessing from formData state
      position: formData.position,
      contactNumber: parseInt(formData.contactNumber), // Convert to integer
      email: formData.email,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/staff",
        staffData
      );
      console.log("Staff added:", response.data);
      alert("Staff added successfully!");
      // Reset form data
      setFormData({ name: "", position: "", contactNumber: "", email: "" });
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to add staff. Please try again.");
    }
  };

  const handleLogoutClick = () => {
    googleLogout();
    onSuccess();
    navigate("/");
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
          <button className="icon-button">👤</button>
          <button className="icon-button">🔔</button>
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
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
            Add Task
          </button>
          <button className="sidebar-btn">Add Staff</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
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
                />
                <TextField
                  label="Email"
                  variant="standard"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="add-btn">
                Add
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Staff;
