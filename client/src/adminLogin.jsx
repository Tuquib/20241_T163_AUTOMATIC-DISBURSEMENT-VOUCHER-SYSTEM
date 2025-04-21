import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = "6LfLiHsqAAAAADCbXE7JlyC2OJSmrON163QlUzrX";
const GOOGLE_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive",
].join(" ");

function Login() {
  const navigate = useNavigate();
  const [recaptchaValue, setRecaptchaValue] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [googleResponse, setGoogleResponse] = useState(null);
  const recaptchaRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleAdminLoginClick = () => {
    navigate("/adminLogin");
  };

  const handleRecaptchaChange = (value) => {
    console.log("reCAPTCHA value set");
    setRecaptchaValue(value);
    console.log("reCAPTCHA value:", value);
  };

  const handleRecaptchaVerification = async () => {
    if (!recaptchaValue) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      console.log(
        "Google login successful, got access token:",
        googleResponse.access_token ? "Yes" : "No"
      );
      
      // Store access token consistently
      localStorage.setItem("access_token", googleResponse.access_token);

      console.log("Fetching user info from Google...");
      // Get user info from Google
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${googleResponse.access_token}` },
        }
      );

      console.log("Got user info:", {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      });

      // Store user info separately
      localStorage.setItem("userEmail", userInfo.data.email);
      localStorage.setItem("userName", userInfo.data.name);
      localStorage.setItem("userPicture", userInfo.data.picture);
      localStorage.setItem("userInfo", JSON.stringify(userInfo.data));
      localStorage.setItem("isAdmin", "true");

      // Initialize Google Drive for admin
      console.log("Initializing Google Drive for admin user...");
      try {
        const driveResponse = await axios.post(
          "http://localhost:8000/api/admin/initialize-drive",
          {
            accessToken: googleResponse.access_token,
            email: userInfo.data.email,
          }
        );
        console.log("Google Drive initialization successful");
      } catch (driveError) {
        console.error("Error initializing Google Drive:", driveError);
        // Continue with login even if drive initialization fails
      }

      console.log("Admin login successful! Redirecting to admin dashboard...");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during Google login:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert("Failed to login with Google. Please try again.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: (response) => {
      setGoogleResponse(response);
      setShowRecaptcha(true);
    },
    onError: (error) => {
      console.error("Google login error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert("Google login failed. Please try again.");
    },
    scope: GOOGLE_SCOPES,
    flow: "implicit"
  });

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
        <button className="login-btn" onClick={handleAdminLoginClick}>Login as Admin</button>
        <button className="login-btn" onClick={handleLoginClick}>Login as Staff</button>
        </nav>
      </header>
      <main className="cont">
        <img
          src="../src/assets/background.png"
          alt="background"
          className="bg"
        />
        <br/><br/><br/><br/><br/><br/>
         <div
    className="login-card"
  >
    <h2 style={{ marginBottom: "1.5rem", color: "#003366", fontSize: "1.5rem" }}>
      Sign In
    </h2>
    {!showRecaptcha ? (
      <button
        type="button"
        onClick={login}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#4285F4",
          color: "#fff",
          fontSize: "1rem",
          fontWeight: "500",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(66, 133, 244, 0.3)",
          transition: "all 0.3s ease",
          marginLeft: "67px",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "#3367D6")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "#4285F4")
        }
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google icon"
          style={{ width: "20px", height: "20px" }}
        />
        Sign in with Google
      </button>
    ) : (
      <>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
          style={{ marginBottom: "1rem" }}
        />
        <button
          type="button"
          onClick={handleRecaptchaVerification}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#4285F4",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "500",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(66, 133, 244, 0.3)",
            transition: "all 0.3s ease",
            marginLeft: "67px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#3367D6")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4285F4")
          }
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google icon"
            style={{ width: "20px", height: "20px" }}
          />
          Continue to Dashboard
        </button>
      </>
    )}
  </div>
      </main>
    </div>
  );
}

export default Login;