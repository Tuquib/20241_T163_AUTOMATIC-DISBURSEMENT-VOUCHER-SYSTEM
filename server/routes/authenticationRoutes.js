import express from "express";
import {
  getLogins,
  getLogin,
  postLogin,
  updateLogin,
  deleteLogin,
  handleGoogleLogin,
} from "../controller/authenticationController.js";

const router = express.Router();

// Route to get all login
router.get("/login", getLogins);

router.get("/manual-login", getLogin);

// Route to create a new login member (you can keep it for registration purposes if needed)
router.post("/login", postLogin);

// Route to update an existing login member by ID
router.patch("/login/:id", updateLogin);

// Route to delete a login member by ID
router.delete("/login/:id", deleteLogin);

// Route for Google login
router.post("/google-login", handleGoogleLogin);

export default router;
