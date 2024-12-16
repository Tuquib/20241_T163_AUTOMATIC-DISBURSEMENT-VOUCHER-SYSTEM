import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signup.css";
import ReCAPTCHA from "react-google-recaptcha";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RECAPTCHA_SITE_KEY = "6LfLiHsqAAAAADCbXE7JlyC2OJSmrON163QlUzrX";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState("");
  const recaptchaRef = useRef(null); // Add this line
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submits
  const [role, setRole] = useState("staff"); // Add state for role
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleRecaptchaChange = (value) => {
    console.log("reCAPTCHA value changed");
    console.log("reCAPTCHA value:", value);
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsSubmitting(true); // Disable button to prevent multiple clicks

    try {
      const response = await axios.post("http://localhost:8000/api/signup", {
        name,
        email,
        password,
        role, // Include role in the request
        recaptcha: recaptchaValue,
      });

      if (response.status === 200) {
        alert("Sign-up successful! Please log in.");
        navigate("/login"); // Navigate to login page
      }
    } catch (error) {
      console.error("Error during sign-up:", error);

      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaValue("");
      }

      if (error.response) {
        // Backend errors
        alert(error.response.data.error || "Sign-up failed!");
      } else {
        // Network or server errors
        alert("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable button
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
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </nav>
      </header>
      <main className="cont">
        <img
          src="../src/assets/background.png"
          alt="background"
          className="bg"
        />
        <div className="signup-card">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            <label>Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="password-toggle-signup"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </div>
            <p onClick={() => navigate("/login")}>
              Already Have Account? Login Here
            </p>
            <br />
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Sign Up"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Signup;
