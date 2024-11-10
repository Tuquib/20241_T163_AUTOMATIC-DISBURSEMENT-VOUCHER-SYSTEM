import Task from "../model/taskDB.js"; // Ensure correct path

//Get task
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving task");
  }
};

//Get task by Id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send("task not found");
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving task");
  }
};

//Create a task
const postTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedtask = await task.save();
    res.status(201).json(savedtask);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error saving task");
  }
};

//Update task
const updateTask = async (req, res) => {
  try {
    const updatedtask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedtask) return res.status(404).send("task not found");
    res.status(200).json(updatedtask);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating task");
  }
};

//Delete task
const deleteTask = async (req, res) => {
  try {
    const deletedtask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedtask) return res.status(404).send("task not found");
    res.status(200).send("task deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting task");
  }
};

export { getTasks, getTask, postTask, updateTask, deleteTask };
