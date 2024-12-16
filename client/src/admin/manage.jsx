import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./manage.css";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Manage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [taskFormValues, setTaskFormValues] = useState({
    payeeName: "",
    type: "",
    date: "",
    time: "",
  });

  const [staffFormValues, setStaffFormValues] = useState({
    name: "",
    position: "",
    email: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/task");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/staff");
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  // Task Edit/Delete
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskFormValues({
      payeeName: task.payeeName,
      type: task.type,
      date: task.date,
      time: task.time,
    });
    setIsEditingTask(true);
  };

  const handleUpdateTask = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/task/${selectedTask._id}`,
        taskFormValues
      );
      fetchTasks();
      setIsEditingTask(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/api/task/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
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

  const handleLogout = () => {
    googleLogout();
    onSuccess();
    navigate("/");
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
          <button className="icon-button">👤</button>
          <button className="icon-button">🔔</button>
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
          <div className="task-card">
            <h3>Tasks</h3>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Payee Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.payeeName}</td>
                    <td>{task.type}</td>
                    <td>{task.date}</td>
                    <td>{task.time}</td>
                    <td>
                      <button onClick={() => handleEditTask(task)}>Edit</button>
                      <button onClick={() => handleDeleteTask(task._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="staff-card">
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

          {/* Task Edit Modal */}
          {isEditingTask && (
            <div className="modal">
              <div className="modal-content">
                <h3>Edit Task</h3>
                <input
                  type="text"
                  value={taskFormValues.payeeName}
                  onChange={(e) =>
                    setTaskFormValues({
                      ...taskFormValues,
                      payeeName: e.target.value,
                    })
                  }
                  placeholder="Payee Name"
                />
                <input
                  type="text"
                  value={taskFormValues.type}
                  onChange={(e) =>
                    setTaskFormValues({
                      ...taskFormValues,
                      type: e.target.value,
                    })
                  }
                  placeholder="Type"
                />
                <input
                  className="date"
                  type="date"
                  value={taskFormValues.date}
                  onChange={(e) =>
                    setTaskFormValues({
                      ...taskFormValues,
                      date: e.target.value,
                    })
                  }
                  placeholder="Date"
                />
                <input
                  className="time"
                  type="time"
                  value={taskFormValues.time}
                  onChange={(e) =>
                    setTaskFormValues({
                      ...taskFormValues,
                      time: e.target.value,
                    })
                  }
                  placeholder="Time"
                />
                <button onClick={handleUpdateTask}>Save</button>
                <button onClick={() => setIsEditingTask(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Staff Edit Modal */}
          {isEditingStaff && (
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
                  value={staffFormValues.contact}
                  onChange={(e) =>
                    setStaffFormValues({
                      ...staffFormValues,
                      contact: e.target.value,
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

export default Manage;
