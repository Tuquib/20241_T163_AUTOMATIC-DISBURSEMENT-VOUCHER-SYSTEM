import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";
const RECAPTCHA_SITE_KEY = "6LfLiHsqAAAAADCbXE7JlyC2OJSmrON163QlUzrX";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }

    console.log("Recaptcha Token:", recaptchaValue);

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
        recaptcha: recaptchaValue, // Ensure this is passed to the backend
      });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token);
        alert("Login successful!");
        navigate("/staffDashboard");
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response) {
        alert(error.response.data.error || "Login failed!");
      } else {
        alert("Network error. Please try again later.");
      }
    }
  };

  const onGoogleSuccess = async (res) => {
    const base64Url = res.credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const user = JSON.parse(atob(base64));

    try {
      const response = await axios.post(
        "http://localhost:8000/api/google-login",
        {
          googleId: user.sub,
          name: user.name,
          email: user.email,
        }
      );

      if (response.status === 200) {
        console.log("Google login successful");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Failed to log in with Google.");
    }
  };

  const onGoogleFailure = (res) => {
    console.error("Google login failed:", res);
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
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="password-toggle-login"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </div>
            <p onClick={() => navigate("/signup")}>No Account? Sign Up Here</p>
            <br />
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
            <button type="submit" className="submit-btn">
              Login
            </button>
            <label style={{ marginTop: "0.5rem" }}>Continue with:</label>
            <GoogleLogin
              clientId={clientId}
              buttonText="Login with Google"
              onSuccess={onGoogleSuccess}
              onFailure={onGoogleFailure}
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
