import mongoose from "mongoose";

// Define the schema for the Task
const taskSchema = new mongoose.Schema({
  entityName: { type: String, required: true },
  staff: { type: String, required: true },
  date: { type: Date, required: true }, // For the date
  time: { type: String, required: true }, // stored as a string (HH:mm format)
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
