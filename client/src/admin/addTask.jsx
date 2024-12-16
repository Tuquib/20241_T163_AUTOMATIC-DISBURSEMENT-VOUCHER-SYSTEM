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
  const [entityName, setEntityName] = useState("");
  const [staff, setStaff] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormValues, setTaskFormValues] = useState({
    entityName: "",
    staff: "",
    date: "",
    time: "",
  });

  // Fetch tasks and staff list on component mount
  useEffect(() => {
    fetchTasks();
    fetchStaffList();
  }, []);

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
    setTaskFormValues({
      entityName: task.entityName,
      staff: task.staff,
      date: task.date,
      time: task.time,
    });
    setIsEditingTask(true);
  };

  // Update task
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
      entityName,
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
                      label="Entity Name"
                      variant="outlined"
                      required
                      value={entityName}
                      onChange={(e) => setEntityName(e.target.value)}
                    />
                    <TextField
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
                    <th>Entity Name</th>
                    <th>Staff</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.entityName}</td>
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
            <div className="edit-form">
              <h3>Edit Task</h3>
              <input
                type="text"
                value={taskFormValues.entityName}
                onChange={(e) =>
                  setTaskFormValues({
                    ...taskFormValues,
                    entityName: e.target.value,
                  })
                }
                placeholder="Payee Name"
              />
              <input
                type="text"
                value={taskFormValues.staff}
                onChange={(e) =>
                  setTaskFormValues({
                    ...taskFormValues,
                    staff: e.target.value,
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
              />
              <button onClick={handleUpdateTask}>Update Task</button>
              <button onClick={() => setIsEditingTask(false)}>Cancel</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AddTask;
