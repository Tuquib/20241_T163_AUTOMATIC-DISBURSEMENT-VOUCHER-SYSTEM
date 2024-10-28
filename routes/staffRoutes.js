const express = require("express");
const staffRoutes = express();

//import controller
const staffs = require("../controller/staffController");
// use controller
staffRoutes.use("staffDb", staffs);

const bodyParser = require("body-parser");
staffRoutes.use(bodyParser.urlencoded({ extended: false }));
staffRoutes.use(bodyParser.json());

// Add a new Staff
staffRoutes.post("/staff", (req, res) => {
  const newStaff = req.body;
  staff.push(newStaff);
  res.status(201).send({ status: "Success", newData: Staff });
});

// Get all Staff
staffRoutes.get("/staff/all", (req, res) => {
  res.status(200).json(staff);
});

// Get SBO Staff
staffRoutes.get("/staff/i/:id", (req, res) => {
  const id = req.params.id;
  const staff = staffs.find((staff) => staff.staff_id == id);
  if (staff) {
    res.status(200).json(staff);
  } else {
    res.status(404).json({ status: "Error", message: "Staff not found" });
  }
});

// Get SBO Staff
staffRoutes.get("/staff/n/:name", (req, res) => {
  const name = req.params.name;
  const staff = staff.find((staff) => staff.staff_name == name);
  if (staff) {
    res.status(200).json(staff);
  } else {
    res.status(404).json({ status: "Error", message: "Staff not found" });
  }
});

// Delete an Staff
staffRoutes.delete("/staff/:id", (req, res) => {
  const id = req.params.id;
  const index = staffs.findIndex((staff) => staff.staff_id == id);
  if (index !== -1) {
    staffs.splice(index, 1);
    res.status(200).json({ status: "Success", newData: staffs });
  } else {
    res.status(404).json({ status: "Error", message: "staff not found" });
  }
});

// Update an Staff
staffRoutes.patch("/staff/:id", (req, res) => {
  const id = req.params.id;
  const index = staffs.findIndex((staff) => staff.staff_id == id);

  //condition of statement
  if (index !== -1) {
    staffs[index] = { ...staffs[index], ...req.body }; // Merging updates
    res.status(200).json({ status: "Success", newData: staffs }); // if success!
  } else {
    res.status(404).json({ status: "Error", message: "staff not found" }); //if Error!
  }
});

module.exports = staffRoutes;
