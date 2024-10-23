const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importing route files
const adminRoutes = require("./routes/adminRoutes");
const apprroveRoutes = require("./routes/aprroveRoutes");
const generationRoutes = require("./routes/generationRoutes");
const manageRoutes = require("./routes/manageRoutes");
const rolesRoutes = require("./routes/roles");
const staffRoutes = require("./routes/staffRoutes");

// Middleware to parse JSON requests
app.use(express.json());

// Using the imported routes
app.use("admin", adminRoutes);
app.use("approve", approveRoutes);
app.use("generation", generationRoutes);
app.use("manage", manageRoutes);
app.use("roles", rolesRoutes);
app.use("staff", staffRoutes);

// Start the server

app.listen(3000);
