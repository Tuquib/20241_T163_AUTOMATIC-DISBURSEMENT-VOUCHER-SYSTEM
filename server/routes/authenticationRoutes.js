import express from "express";
import {
  getLogins,
  getLogin,
  handleLogin,
  updateLogin,
  deleteLogin,
  handleGoogleLogin,
  handleSignUp,
} from "../controller/authenticationController.js";

const router = express.Router();

// Route to get all login
router.get("/login", getLogins);

// Route to create a new login member (you can keep it for registration purposes if needed)
router.post("/login", handleLogin);

// Route for user signup
router.post("/signup", handleSignUp); // For sign-up

router.get("/manual-login", getLogin);

// Route to update an existing login member by ID
router.patch("/login/:id", updateLogin);

// Route to delete a login member by ID
router.delete("/login/:id", deleteLogin);

// Route for Google login
router.post("/google-login", handleGoogleLogin);

export default router;
