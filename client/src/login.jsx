import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleStaffClick = () => {
    navigate("/addStaff"); // Navigate to the Login route when button is clicked
  };

  const handleDashboardClick = () => {
    navigate("/dashboard"); // Navigate to the Login route when button is clicked
  };

  const googleAuth = () => {
    try {
      window.open("http://localhost:8080/auth/google", "_self");
    } catch (error) {
      console.error("Google authentication failed:", error);
    }
  };

  return (
    <div className="App">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Acounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="login-btn">Login</button>
        </nav>
      </header>
      <main className="cont">
        <img
          src="../src/assets/background.png"
          alt="background"
          className="bg"
        />
        <div className="login-card">
          <h2>Sign In</h2>
          <form>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
            <button
              type="submit"
              className="submit-btn"
              onClick={handleDashboardClick}
            >
              Login
            </button>

            <label style={{ marginTop: "0.5rem" }}>Continue with:</label>
            <button className="google_btn" onClick={googleAuth}>
              <img src="../src/assets/google.png" alt="google icon" />
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
export default Login;
