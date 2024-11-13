import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making HTTP requests
import "./login.css";
import ReCAPTCHA from "react-google-recaptcha";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";
const RECAPTCHA_SITE_KEY = "6LfLiHsqAAAAADCbXE7JlyC2OJSmrON163QlUzrX";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState("");

  const navigate = useNavigate();

  const onSuccess = async (res) => {
    const base64Url = res.credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const user = JSON.parse(atob(base64));

    try {
      // Send user data to the backend for MongoDB storage
      const response = await axios.post(
        "http://localhost:8000/api/google-login",
        {
          googleId: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture,
        }
      );

      console.log("Login Successful!:", user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("Failed to log in with Google.");
    }
  };

  const onFailure = (res) => {
    console.log("Login failed! res: ", res);
  };

  const handleLogin = () => {
    if (recaptchaValue) {
      // Continue login if reCAPTCHA is solved
      navigate("/staffDashboard");
    } else {
      alert("Please complete the reCAPTCHA verification.");
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  // Handle manual login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:8000/api/login", {
        email,
        password,
      });

      // Handle success response
      if (response.status === 200) {
        const { token } = response.data;
        // Store the token (localStorage, cookie, or state management)
        localStorage.setItem("token", token); // Example: save token in localStorage
        console.log("Manual login successful!");
        navigate("/staffDashboard");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please check your email and password.");
    }
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
              required
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              className="recaptcha"
            />
            <button type="submit" className="submit-btn" onClick={handleLogin}>
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
