const router = require("express").Router();
const passport = require("passport");

// Success route
router.get("/login/success", (req, res) => {
  if (req.user) {
    console.log("User authenticated:", req.user);
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    console.log("User not authenticated");
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

// Failure route
router.get("/login/failed", (req, res) => {
  console.log("Login failed");
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

// Google authentication route
router.get(
  "/google",
  (req, res, next) => {
    console.log("Starting Google authentication...");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback route
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Callback reached");
    next();
  },
  passport.authenticate("google", {
    failureRedirect: "/auth/login/failed", // Updated failure URL to match route structure
  }),
  (req, res) => {
    console.log("Google authentication successful");
    res.redirect("http://localhost:3000"); // Redirect to frontend after successful login
  }
);

// Logout route with session clearing for cookie-session
router.get("/logout", (req, res) => {
  req.session = null; // Clears the cookie-session, effectively logging the user out
  console.log("User logged out");
  res.redirect("http://localhost:3000"); // Redirect to frontend after logout
});

module.exports = router;
