import express from "express";
import {
  getLogins,
  getLogin,
  postLogin,
  updateLogin,
  deleteLogin,
} from "../controller/authenticationController.js";

const router = express.Router();

// Route to get all login
router.get("/login", getLogins);

// Route to get a single login by ID
router.get("/login/:id", getLogin);

// Route to create a new login member
router.post("/login", postLogin);

// Route to update an existing login member by ID
router.patch("/login/:id", updateLogin);

// Route to delete a login member by ID
router.delete("/login/:id", deleteLogin);

export default router;
