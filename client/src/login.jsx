import * as React from "react";
import Button from "@mui/material/Button";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import GoogleIcon from "@mui/icons-material/Google";
import "./login.css";

function Login() {
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
      <main className="content">
        <img
          src="../src/assets/background.png"
          alt="background"
          className="background"
        />
        <div className="login-card">
          <h2>Sign Up</h2>
          <form>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />
            <label>Password</label>
            <input type="password" placeholder="Enter your password" required />
            <button type="submit" className="submit-btn">
              Login
            </button>

            <label style={{ marginTop: "0.5rem" }}>Continue with:</label>
            <Button
              className="google-btn"
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ marginTop: "0.5rem" }}
            >
              Google
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;
