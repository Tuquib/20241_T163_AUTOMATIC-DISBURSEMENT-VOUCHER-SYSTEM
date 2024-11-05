import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLoginClick = () => {
    navigate("/login"); // Navigate to the Login route when button is clicked
  };

  return (
    <div className="App">
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="login-btn" onClick={handleLoginClick}>
            Login
          </button>
        </nav>
      </header>
      <main className="container">
        <img
          src="../src/assets/background.png"
          alt="background"
          className="imageBackground"
        />
      </main>
    </div>
  );
}
export default App;
