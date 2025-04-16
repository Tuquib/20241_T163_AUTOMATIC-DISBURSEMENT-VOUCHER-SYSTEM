import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";


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
  </div>
      </main>
    </div>
  );
}

export default Login;