import express from "express";
const router = express.Router();

import {
  getLogins,
  getLogin,
  handleLogin,
  handleSignUp,
  updateLogin,
  deleteLogin,
  getUserProfile,
  refreshTokenHandler,
  updateGoogleProfile,
  requestPasswordReset,
  verifyCode,
  verifyCodeAndResetPassword
} from "../controller/authenticationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Get all logins
router.get("/", getLogins);

// Get single login
router.get("/:id", getLogin);

// Get user profile
router.get("/profile/:id", verifyToken, getUserProfile);

// Add new login
router.post("/", handleSignUp);

// Login user
router.post("/login", handleLogin);

// Refresh token
router.post("/refresh-token", refreshTokenHandler);

// Update google profile
router.post("/update-google-profile", updateGoogleProfile);

// Update login
router.patch("/:id", updateLogin);

// Delete login
router.delete("/:id", deleteLogin);

// Route for requesting password reset
router.post("/forgot-password", requestPasswordReset);

// Route for verifying code
router.post("/verify-code", verifyCode);

// Route for verifying code and resetting password
router.post("/verify-and-reset", verifyCodeAndResetPassword);

export default router;
