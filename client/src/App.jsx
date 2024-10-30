import * as React from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
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
          <a href="login.jsx">
            <button className="login-btn">Login</button>
          </a>
        </nav>
      </header>
      <main className="content">
        <img
          src="../src/assets/background.png"
          alt="background"
          className="background"
        />
      </main>
    </div>
  );
}

export default App;
