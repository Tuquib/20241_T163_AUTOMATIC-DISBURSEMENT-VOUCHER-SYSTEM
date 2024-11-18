import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);

  // Handle Google login success
  const handleLoginSuccess = async (response) => {
    try {
      const token = response.credential;
      
      // Send token to the backend to verify and fetch user data
      const { data } = await axios.post("http://localhost:5000/api/auth/google", { token });
      
      setUser(data.user); // Set user data from the backend
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div style={{ display: "flex", alignItems: "center" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={user.picture} alt="Profile" style={{ width: 50, height: 50, borderRadius: "50%", marginRight: 10 }} />
            <div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log("Login Failed")}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Profile;
