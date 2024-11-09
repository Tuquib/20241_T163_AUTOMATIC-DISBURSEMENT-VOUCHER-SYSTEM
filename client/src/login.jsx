import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "./login.css";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSuccess = (res) => {
    console.log("Login Success! Current user: ", res.profileObj);
    navigate("/addStaff");
  };

<<<<<<< HEAD
  const handleDashboardClick = () => {
    navigate("/dashboard"); // Navigate to the Login route when button is clicked
  };

  const googleAuth = () => {
    try {
      window.open("http://localhost:8080/auth/google", "_self");
    } catch (error) {
      console.error("Google authentication failed:", error);
    }
=======
  const onFailure = (res) => {
    console.log("Login failed! res: ", res);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted: ", email, password);
>>>>>>> a88c3bee2aeffa580c94a72b59c4ea041748dc8f
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
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Password</label>
<<<<<<< HEAD
            <input type="password" placeholder="Enter your password" />
            <button
              type="submit"
              className="submit-btn"
              onClick={handleDashboardClick}
            >
=======
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submit-btn">
>>>>>>> a88c3bee2aeffa580c94a72b59c4ea041748dc8f
              Login
            </button>

            <label style={{ marginTop: "0.5rem" }}>Continue with:</label>
            <GoogleLogin
              clientId={clientId}
              buttonText="Login with Google"
              onSuccess={onSuccess}
              onFailure={onFailure}
              cookiePolicy="single_host_origin"
              isSignedIn={true}
            />
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;
