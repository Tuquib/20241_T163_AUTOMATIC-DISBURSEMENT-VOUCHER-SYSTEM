import Authentication from "../model/authenticationDB.js";
import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { sendVerificationCode } from '../services/emailService.js';
import mongoose from 'mongoose';
import Staff from "../model/staffDB.js";

dotenv.config();

// Get all logins
const getLogins = async (req, res) => {
  try {
    const logins = await Authentication.find();
    res.status(200).json(logins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving logins");
  }
};

// Login logic
const handleLogin = async (req, res) => {
  const { email, password, recaptcha } = req.body;

  // Step 1: Verify reCAPTCHA
  if (!recaptcha) {
    console.log("reCAPTCHA verification failed: No token provided");
    return res
      .status(400)
      .json({ error: "Please complete the reCAPTCHA verification." });
  }

  try {
    console.log("Starting reCAPTCHA verification process...");
    console.log(
      "Recaptcha Token received: ",
      recaptcha.substring(0, 20) + "..."
    ); // Log partial token for security

    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
        },
      }
    );

    console.log("reCAPTCHA verification response:", recaptchaResponse.data);

    if (!recaptchaResponse.data.success) {
      console.log(
        "reCAPTCHA verification failed:",
        recaptchaResponse.data["error-codes"]
      );
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }

    console.log("✅ reCAPTCHA verification successful!");

    // Find user by email
    const user = await Authentication.findOne({ email });
    console.log("User lookup result: ", user ? "User found" : "User not found");

    if (!user) {
      console.log("Login failed: Invalid email");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password verification:", isMatch ? "Success" : "Failed");

    if (!isMatch) {
      console.log("Login failed: Invalid password");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Fetch staff data to get the picture
    const staffData = await Staff.findOne({ email: user.email });
    const picture = staffData ? staffData.picture : null;

    // Update Authentication user's picture if staff picture exists
    if (picture) {
      user.picture = picture;
      await user.save();
    }

    // Generate JWT token with longer expiration
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Changed to 7 days
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("JWT tokens generated successfully");
    console.log(
      "🎉 Login successful with reCAPTCHA verification for user:",
      email
    );
    console.log("User role:", user.role);

    // Send single success response with all information
    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Server error during login" });
  }
};

// Sign-up logic
const handleSignUp = async (req, res) => {
  const { name, email, role, password, recaptcha } = req.body;

  // Step 1: Verify reCAPTCHA
  if (!recaptcha) {
    return res.status(400).json({ error: "reCAPTCHA token is missing." });
  }

  try {
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
        },
      }
    );

    const { success, "error-codes": errorCodes } = recaptchaResponse.data;

    if (!success) {
      console.error("reCAPTCHA verification failed:", errorCodes);
      return res.status(400).json({ error: "reCAPTCHA verification failed." });
    }

    // Step 2: Check if user already exists
    const existingUser = await Authentication.findOne({ email });
    if (existingUser) {
      console.error(`Sign-up failed: User with email ${email} already exists.`);
      return res.status(400).json({ error: "User already registered." });
    }

    // Step 3: Hash the password and create the new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Authentication({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    console.log("User created successfully:", newUser);

    // Step 4: Send success response
    res.status(200).json({ message: "Sign-up successful!" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch a login by ID (optional, if needed for other functionalities)
const getLogin = async (req, res) => {
  try {
    // Check if the ID is a special route
    if (req.params.id === 'vouchers') {
      // Use the Voucher model instead of Authentication
      const Voucher = mongoose.model('Voucher');
      const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
      return res.status(200).json(vouchers);
    }

    // Check if the ID is a special route for counters
    if (req.params.id === 'nextFundCluster' || req.params.id === 'nextDvNumber') {
      return res.status(404).json({ error: "This route is not handled by the authentication controller" });
    }

    // Otherwise, try to find by ID
    const login = await Authentication.findById(req.params.id);
    if (!login) return res.status(404).send("Login not found.");
    res.status(200).json(login);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving login.");
  }
};

// Update login by ID
const updateLogin = async (req, res) => {
  try {
    const updatedLogin = await Authentication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedLogin) return res.status(404).send("Login not found.");
    res.status(200).json(updatedLogin);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating login.");
  }
};

// Delete login by ID
const deleteLogin = async (req, res) => {
  try {
    const deletedLogin = await Authentication.findByIdAndDelete(req.params.id);
    if (!deletedLogin) return res.status(404).send("Login not found.");
    res.status(200).send("Login deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting login.");
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware
    const user = await Authentication.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      name: user.name || 'User',
      email: user.email,
      role: user.role,
      picture: user.picture || null
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: "Error retrieving user profile" });
  }
};

// Refresh token handler
const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Find user
    const user = await Authentication.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new access token
    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token: newToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

// Update user's Google profile
const updateGoogleProfile = async (req, res) => {
  try {
    const { email, picture } = req.body;

    // Find and update user in Authentication collection
    const user = await Authentication.findOneAndUpdate(
      { email },
      { picture },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Also update the Staff collection if the user exists there
    await Staff.findOneAndUpdate(
      { email },
      { picture },
      { new: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error updating Google profile:', error);
    res.status(500).json({ error: "Error updating profile" });
  }
};

// Request password reset with verification code
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Authentication.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    // Save verification code to user
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    await user.save();

    // Send verification code email
    await sendVerificationCode(email, verificationCode);

    res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Error in password reset request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify verification code
const verifyCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    const user = await Authentication.findOne({
      email,
      verificationCode,
      verificationCodeExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify code and reset password
const verifyCodeAndResetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    
    const user = await Authentication.findOne({
      email,
      verificationCode,
      verificationCodeExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear verification code
    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in password reset:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
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
};
