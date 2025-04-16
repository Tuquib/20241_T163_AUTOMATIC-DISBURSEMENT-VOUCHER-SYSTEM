import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useGoogleLogin } from "@react-oauth/google";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleAdminLoginClick = () => {
    navigate("/adminLogin");
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log(
          "Google login successful, got access token:",
          response.access_token ? "Yes" : "No"
        );
        
        // Store access token consistently
        localStorage.setItem("access_token", response.access_token);

        console.log("Fetching user info from Google...");
        // Get user info from Google
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
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

        // Update user's profile picture in the database
        try {
          await axios.post("http://localhost:8000/api/update-google-profile", {
            email: userInfo.data.email,
            picture: userInfo.data.picture,
          });
          console.log("Profile picture updated in database");
        } catch (error) {
          console.error("Error updating profile picture:", error);
        }

        console.log("Checking user role (staff vs admin)...");
        // Check if the user's email exists in staff collection
        try {
          const staffResponse = await axios.get(
            `http://localhost:8000/api/staff/email/${userInfo.data.email}`
          );
          console.log(
            "User found in staff collection - proceeding with staff login"
          );

          if (staffResponse.data) {
            localStorage.setItem("isAdmin", "false");
            console.log(
              "Staff login successful! Redirecting to staff dashboard..."
            );
            navigate("/staffDashboard");
          }
        } catch (error) {
          // If error is 404, user is not a staff member
          if (error.response && error.response.status === 404) {
            console.log(
              "User not found in staff collection - proceeding with admin login"
            );

            // Initialize Google Drive for admin
            console.log("Initializing Google Drive for admin user...");
            try {
              const driveResponse = await axios.post(
                "http://localhost:8000/api/admin/initialize-drive",
                {
                  accessToken: response.access_token,
                  email: userInfo.data.email,
                }
              );
              console.log("Google Drive initialization successful");
            } catch (driveError) {
              console.error("Error initializing Google Drive:", driveError);
              // Continue with login even if drive initialization fails
            }

            localStorage.setItem("isAdmin", "true");
            console.log(
              "Admin login successful! Redirecting to admin dashboard..."
            );
            navigate("/dashboard");
          } else {
            console.error("Unexpected error during role check:", error);
            throw error;
          }
        }
      } catch (error) {
        console.error("Error during Google login:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        alert("Failed to login with Google. Please try again.");
      }
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

  const handleRecaptchaChange = (value) => {
    console.log("reCAPTCHA value set"); // Debug log
    setRecaptchaValue(value);
    console.log("reCAPTCHA value:", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaValue) {
      alert("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
        recaptcha: recaptchaValue,
      });

      if (response.data.success) {
        // Store all necessary user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userRole", response.data.user.role);
        localStorage.setItem("isAdmin", String(response.data.user.role === "admin"));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("access_token", response.data.token);

        // Navigate based on role
        if (response.data.user.role === "admin") {
          console.log(
            "Admin login successful! Redirecting to admin dashboard..."
          );
          navigate("/dashboard", { replace: true });
        } else if (response.data.user.role === "staff") {
          console.log(
            "Staff login successful! Redirecting to staff dashboard..."
          );
          navigate("/staffDashboard", { replace: true });
        }
      }
    } catch (error) {
      console.error("Login error details:", error);
      // More specific error messages
      if (error.response?.status === 401) {
        alert("Invalid email or password. Please try again.");
      } else if (error.response?.status === 400) {
        alert(
          error.response.data.error ||
            "Invalid input. Please check your details."
        );
      } else {
        alert("Login failed. Please try again later.");
      }

      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaValue("");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      alert("Please enter your email address first");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/forgot-password", {
        email: forgotPasswordEmail
      });
      setShowForgotPassword(false);
      setShowVerificationModal(true);
      alert("Verification code has been sent to your email.");
    } catch (error) {
      console.error("Error requesting verification code:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      alert("Please enter the verification code");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/verify-code", {
        email: forgotPasswordEmail,
        verificationCode
      });
      if (response.data.valid) {
        setShowVerificationModal(false);
        setShowNewPasswordModal(true);
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      alert("Invalid verification code. Please try again.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/verify-and-reset", {
        email: forgotPasswordEmail,
        verificationCode,
        newPassword
      });
      alert("Password reset successful! Please login with your new password.");
      setShowNewPasswordModal(false);
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      setForgotPasswordEmail("");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert(error.response?.data?.error || "An error occurred. Please try again.");
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
            <div className="forgot-password">
              <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span>
            </div>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
            <button type="submit">Login</button>
            <label style={{ marginTop: "0.5rem" }}>Continue with:</label>
            <button type="google-btn" onClick={login}>
              Sign in with Google
            </button>
          </form>
          {showForgotPassword && (
            <div className="forgot-password-modal">
              <div className="modal-content">
                <h3>Reset Password</h3>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                  />
                </div>
                <button onClick={handleForgotPassword}>Send Verification Code</button>
                <button
                  className="close-modal"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                  }}
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {showVerificationModal && (
            <div className="forgot-password-modal">
              <div className="modal-content">
                <h3>Enter Verification Code</h3>
                <form onSubmit={handleVerifyCode}>
                  <div className="form-group">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Verify Code</button>
                  <button
                    className="close-modal"
                    onClick={() => {
                      setShowVerificationModal(false);
                      setVerificationCode("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {showNewPasswordModal && (
            <div className="forgot-password-modal">
              <div className="modal-content">
                <h3>Set New Password</h3>
                <form onSubmit={handlePasswordReset}>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Reset Password</button>
                  <button
                    className="close-modal"
                    onClick={() => {
                      setShowNewPasswordModal(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Login;