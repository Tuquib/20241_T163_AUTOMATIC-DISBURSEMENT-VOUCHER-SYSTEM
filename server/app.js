const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importing route files
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");

// Middleware to parse JSON requests
app.use(express.json());

// Using the imported routes
app.use("admin", adminRoutes);
app.use("staff", staffRoutes);

// Start the server

app.listen(3000);
