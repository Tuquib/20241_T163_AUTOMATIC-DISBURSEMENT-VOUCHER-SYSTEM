import express from "express";
import {
  getTasks,
  getDefaultDate,
  getTaskById,
  getTaskByStaff,
  postTask,
  updateTask,
  deleteTask,
} from "../controller/taskController.js";

const router = express.Router();

// Route to get all staff
router.get("/task", getTasks);

router.get("/defaultDate", getDefaultDate);

router.get("/task/:id", getTaskById);

router.get("/task/staff/:email", getTaskByStaff);

// Route to create a new staff member
router.post("/task", postTask);

// Route to update an existing staff member by ID
router.patch("/task/:id", updateTask);

// Route to delete a staff member by ID
router.delete("/task/:id", deleteTask);

export default router;
