import express from "express";
import {
  getLogins,
  getLogin,
  handleLogin,
  updateLogin,
  deleteLogin,
  handleSignUp,
  getUserProfile,
  refreshTokenHandler,
  updateGoogleProfile
} from "../controller/authenticationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get all login
router.get("/login", getLogins);

// Route to create a new login member (you can keep it for registration purposes if needed)
router.post("/login", handleLogin);

// Route for user signup
router.post("/signup", handleSignUp);

// Route to update an existing login member by ID
router.patch("/login/:id", updateLogin);

// Route to delete a login member by ID
router.delete("/login/:id", deleteLogin);

// Route to get user profile
router.get("/profile", verifyToken, getUserProfile);

// Route to refresh token
router.post("/refresh-token", refreshTokenHandler);

// Route to update Google profile
router.post("/update-google-profile", updateGoogleProfile);

export default router;
