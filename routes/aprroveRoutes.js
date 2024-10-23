const express = require("express");
const manageRoutes = express();

const bodyParser = require("body-parser");
manageRoutes.use(bodyParser.urlencoded({ extended: false }));
manageRoutes.use(bodyParser.json());

// Add a new Staff
manageRoutes.post("/vouchers/:id/submit", (req, res) => {});

// Get all Staff
manageRoutes.post("/vouchers/:id/approve", (req, res) => {});

// Get SBO Staff
manageRoutes.get("/vouchers/:id/reject", (req, res) => {});
