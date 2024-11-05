import * as React from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import GoogleIcon from "@mui/icons-material/Google";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const handleStaffClick = () => {
    navigate("/addStaff");
  };

  return (
    <div className="Login">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
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
          className="background"
        />
        <div className="login-card">
          <h2>Sign Up</h2>
          <form>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" required />
            <label>Password</label>
            <input type="password" placeholder="Enter your password" required />
            <button className="submit" onClick={handleStaffClick}>
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
