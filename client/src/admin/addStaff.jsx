import React, { useState, useEffect } from "react";
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
  const [staff, setStaff] = useState([]);
  const [isEditingStaff, setIsEditingStaff] = useState(false);  
  const [isAddingStaff, setIsAddingStaff] = useState(false); 
  const [selectedStaff, setSelectedStaff] = useState(null);

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
  
  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/staff");
      setStaff(response.data);
  
      // If no data, show the form
      if (response.data.length === 0) {
        setIsAddingStaff(true);
      } else {
        setIsAddingStaff(false); // Default to showing the table if data exists
      }
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
  const handleSubmit = async () => {
  
    const staffData = {
      name: formData.name,
      position: formData.position,
      contactNumber: parseInt(formData.contactNumber), // Ensure this is a number
      email: formData.email,
    };
  
    try {
      const response = await axios.post(
        "http://localhost:8000/api/staff",
        staffData
      );
      console.log("Staff added:", response.data);
      alert("Staff added successfully!");
  
      // Fetch updated staff list
      await fetchStaff();
  
      // Reset form and switch back to table view
      setFormData({ name: "", position: "", contactNumber: "", email: "" });
      setIsAddingStaff(true); // Switch to table view
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
            Task
          </button>
          <button className="sidebar-btn">Staff</button>
          <button className="sidebar-btn">Google Drive</button>
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
    </>
  ) : (
    <>
      <div className="staff-card">
      <button className="staff-button"  onClick={() => setIsAddingStaff(true)}>Add</button>
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
                  <button onClick={() => handleEditStaff(member)}>Edit</button>
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

{isEditingStaff && selectedStaff && (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Staff</h3>
        <input
          type="text"
          value={staffFormValues.name}
          onChange={(e) =>
            setStaffFormValues({
              ...staffFormValues,
              name: e.target.value,
            })
          }
          placeholder="Name"
        />
        <input
          type="text"
          value={staffFormValues.position}
          onChange={(e) =>
            setStaffFormValues({
              ...staffFormValues,
              position: e.target.value,
            })
          }
          placeholder="Position"
        />
        <input
          type="email"
          value={staffFormValues.email}
          onChange={(e) =>
            setStaffFormValues({
              ...staffFormValues,
              email: e.target.value,
            })
          }
          placeholder="Email"
        />
        <input
          type="text"
          value={staffFormValues.contactNumber}
          onChange={(e) =>
            setStaffFormValues({
              ...staffFormValues,
              contactNumber: parseInt(e.target.value) || "",
            })
          }
          placeholder="Contact"
        />
        <button onClick={handleUpdateStaff}>Save</button>
        <button onClick={() => setIsEditingStaff(false)}>Cancel</button>
      </div>
    </div>
  )}

</main>
</div>
</div>
);
}

export default Staff;
