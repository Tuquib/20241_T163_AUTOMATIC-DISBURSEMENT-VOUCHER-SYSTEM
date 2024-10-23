const express = require("express");
const manageRoutes = express();

const bodyParser = require("body-parser");
manageRoutes.use(bodyParser.urlencoded({ extended: false }));
manageRoutes.use(bodyParser.json());

// Add a new Staff
manageRoutes.get("/vouchers", (req, res) => {});

// Get all Staff
manageRoutes.post("/vouchers", (req, res) => {});

// Get SBO Staff
manageRoutes.get("/vouchers/i/:id", (req, res) => {});

// Get SBO Staff
manageRoutes.put("/vouchers/i/:id", (req, res) => {});

// Delete an Staff
manageRoutes.delete("/vouhcers/:id", (req, res) => {
  const id = req.params.id;
  const index = staffs.findIndex((staff) => staff.staff_id == id);
  if (index !== -1) {
    staffs.splice(index, 1);
    res.status(200).json({ status: "Success", newData: staffs });
  } else {
    res.status(404).json({ status: "Error", message: "staff not found" });
  }
});

module.exports = manageRoutes;
