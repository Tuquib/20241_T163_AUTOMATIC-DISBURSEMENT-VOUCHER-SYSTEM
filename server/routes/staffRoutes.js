import express from "express";
import {
  getStaffs,
  getStaff,
  postStaff,
  updateStaff,
  deleteStaff,
  getStaffByEmail
} from "../controller/staffController.js";

const router = express.Router();

// Route to get all staff
router.get("/staff", getStaffs);

// Route to get a single staff by ID
router.get("/staff/:id", getStaff);

// Route to get a single staff by email
router.get("/staff/email/:email", getStaffByEmail);

// Route to create a new staff member
router.post("/staff", postStaff);

// Route to update an existing staff member by ID
router.patch("/staff/:id", updateStaff);

// Route to delete a staff member by ID
router.delete("/staff/:id", deleteStaff);

export default router;
