import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./signup.css";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = "6LfLiHsqAAAAADCbXE7JlyC2OJSmrON163QlUzrX";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submits
  const navigate = useNavigate();

  const handleRecaptchaChange = (value) => {
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
        recaptcha: recaptchaValue,
      });

      if (response.status === 200) {
        alert("Sign-up successful! Please log in.");
        navigate("/login"); // Navigate to login page
      }
    } catch (error) {
      console.error("Error during sign-up:", error);

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
        <div className="login-card">
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
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p onClick={() => navigate("/login")}>
              Already Have Account? Login Here
            </p>
            <br />
            <ReCAPTCHA
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
