import * as React from "react";
import "./addStaff.css";
import React, { useState, useEffect } from 'react';

const Staff = () => {

  const [staff, setStaffs] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    email: '',
    contact_num: ''
  });
  const [updateStaff, setUpdateStaffs] = useState({
    id: '',
    name: '',
    position: '',
    email: '',
    contact_num: ''
  });
  const [deleteId, setDeleteId] = useState('');

  // Function to fetch all staff (GET)
  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/staff/');
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setStaffs(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch staffs on component mount
  useEffect(() => {
    fetchStaffs();
  }, []);

  // Handle form input change
  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add staff (POST)
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/staff/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStaff)
      });
      if (!response.ok) {
        throw new Error('Failed to add staff');
      }
      await fetchStaffs();
      setNewStaff({ name: '', position: '', email: '', contact_num: '' });
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  // Update staff (PATCH)
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/staff/${updateStaff.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateStaff)
      });
      if (!response.ok) {
        throw new Error('Failed to update staff');
      }
      await fetchStaffs();
      setUpdateStaff({ id: '', name: '', gender: '', position: '', contact_num: '' });
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  // Delete staff (DELETE)
  const handleDeleteStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/staff/${deleteId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }
      await fetchStaffs();
      setDeleteId('');
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

function Staff() {
  return (
    <div className="App">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Acounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="logout-btn">Logout</button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
          <button className="sidebar-btn">Manage</button>
          <button className="sidebar-btn">Add Task</button>
          <button className="sidebar-btn">Add Staff</button>
          <button className="sidebar-btn">Google Drive</button>
        </aside>
        <main className="content">
          <h1 className="form-title">Add Staff</h1>
          <div className="form-card">
            <form className="staff-form">
              <div className="form-row">
                <input type="text" placeholder="Name" required />
                <input type="text" placeholder="Position" required />
              </div>
              <div className="form-row">
                <input type="tel" placeholder="Contact Number" required />
                <input type="email" placeholder="Email Address" required />
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
}

export default Staff;
