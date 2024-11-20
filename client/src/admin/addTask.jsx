import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./addTask.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddTask = () => {
  const navigate = useNavigate();

  // Sidebar navigation functions
  const handleStaffClick = () => navigate("/addStaff");
  const handleLogoutClick = () => navigate("/");
  const handleDashboardClick = () => navigate("/dashboard");
  const handleManageClick = () => navigate("/manage");

  // State Variables
  const [payeeName, setPayeeName] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormValues, setTaskFormValues] = useState({
    payeeName: "",
    type: "",
    date: "",
    time: "",
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

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
      payeeName: task.payeeName,
      type: task.type,
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
      await axios.delete(`http://localhost:8000/api/task/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Submit new task
  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      payeeName,
      type,
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
              <button className="task-button" onClick={() => setIsAddingTask(true)}>Add</button>
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
                        <button className="dm" onClick={() => handleDeleteTask(task._id)}>Delete</button>
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
        </main>
      </div>
    </div>
  );
};

export default AddTask;
