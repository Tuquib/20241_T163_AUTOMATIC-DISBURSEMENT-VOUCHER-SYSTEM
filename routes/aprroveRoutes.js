const express = require("express");
const approveRoutes = express();

const bodyParser = require("body-parser");
approveRoutes.use(bodyParser.urlencoded({ extended: false }));
approveRoutes.use(bodyParser.json());

// Add a to Submit
approveRoutes.post("/vouchers/:id/submit", (req, res) => {});

// add to aprrove
approveRoutes.post("/vouchers/:id/approve", (req, res) => {});

// Add to reject
approveRoutes.post("/vouchers/:id/reject", (req, res) => {});

module.exports = approveRoutes;
