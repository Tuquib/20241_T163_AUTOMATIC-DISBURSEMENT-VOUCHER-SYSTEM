require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["ADVS API"],
    maxAge: 24 * 60 * 60 * 1000, // Correct maxAge to one day in ms
  })
);

// Debugging middleware for session inspection
app.use((req, res, next) => {
  console.log("Session:", req.session);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Required for cookies in cross-origin requests
  })
);

app.use("/auth", authRoute);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
