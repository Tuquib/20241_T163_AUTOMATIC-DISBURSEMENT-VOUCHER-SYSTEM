import express from "express";
import {
  getTasks,
  getTask,
  postTask,
  updateTask,
  deleteTask,
} from "../controller/taskController.js";

const router = express.Router();

// Route to get all staff
router.get("/task", getTasks);

// Route to get a single staff by ID
router.get("/task/:id", getTask);

// Route to create a new staff member
router.post("/task", postTask);

// Route to update an existing staff member by ID
router.patch("/task/:id", updateTask);

// Route to delete a staff member by ID
router.delete("/task/:id", deleteTask);

export default router;
