import Task from "../model/taskDB.js";
import Staff from "../model/staffDB.js";
import Notification from "../model/notificationDB.js";

//Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving tasks");
  }
};

// Get tasks by staff email
const getTaskByStaff = async (req, res) => {
  try {
    const staffEmail = req.params.email;
    if (!staffEmail) {
      return res.status(400).json({ message: "Staff email is required" });
    }

    // Find the staff member first
    const staff = await Staff.findOne({ email: staffEmail });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Find tasks where the staff field matches either the email or the position
    const tasks = await Task.find({
      $or: [
        { staff: staffEmail },
        { staff: staff.position }
      ]
    });
    
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks for staff:", error);
    res.status(500).json({ message: "Error retrieving staff tasks" });
  }
};

const getDefaultDate = async (req, res) => {
  try {
    const latestTask = await Task.findOne().sort({ date: -1 });
    if (latestTask) {
      return res.json({ date: latestTask.date });
    }
    return res.json({ date: new Date() });
  } catch (error) {
    console.error("Error fetching default date:", error);
    res.status(500).json({ error: "Unable to fetch default date" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    res.status(500).json({ error: "Unable to fetch task" });
  }
};

// Create a new task
const postTask = async (req, res) => {
  try {
    const { payeeName, staff, date, time } = req.body;
    
    // Validate required fields
    if (!payeeName || !staff || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find staff member to get their name
    const staffMember = await Staff.findOne({ email: staff });
    if (!staffMember) {
      return res.status(400).json({ error: "Staff member not found" });
    }

    const task = new Task({
      payeeName,
      staff,
      date,
      time
    });

    const savedTask = await task.save();

    // Create notification for the staff
    const notification = new Notification({
      message: `New task assigned: Create voucher for ${payeeName}`,
      type: 'task_assigned',
      staffEmail: staff,
      staffName: staffMember.name,
      read: false,
      createdAt: new Date()
    });
    await notification.save();

    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Unable to create task" });
  }
};

// Update an existing task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        task[key] = updates[key];
      }
    });

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Unable to update task" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Unable to delete task" });
  }
};

export {
  getTasks,
  getDefaultDate,
  getTaskById,
  getTaskByStaff,
  postTask,
  updateTask,
  deleteTask,
};
