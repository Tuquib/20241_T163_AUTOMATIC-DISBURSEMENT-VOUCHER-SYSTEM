const express = require("express");
const adminRoutes = express();

const bodyParser = require("body-parser");
adminRoutes.use(bodyParser.urlencoded({ extended: false }));
adminRoutes.use(bodyParser.json());

adminRoutes.post("/admin", (req, res) => {
  const newAdmin = req.body;
  admin.push(newAdmin);
  res.status(201).send({ status: "Success", newData: Admin });
});

// Get all admins
adminRoutes.get("/admin/all", (req, res) => {
  res.status(200).json(subjects);
});

// Get admin by ID
adminRoutes.get("/admin/i/:id", (req, res) => {
  const id = req.params.id;
  const admin = admins.find((admin) => admin.admin_id == id);
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(404).json({ status: "Error", message: "Admin not found" });
  }
});

// Get admin by name
adminRoutes.get("/admin/n/:name", (req, res) => {
  const name = req.params.name;
  const admin = admins.find((admin) => admin.admin_name == name);
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(404).json({ status: "Error", message: "Admin not found" });
  }
});

// Delete a admin by ID
adminRoutes.delete("/admin/:id", (req, res) => {
  const id = req.params.id;
  const index = admins.findIndex((admin) => admin.admin_id == id);
  if (index !== -1) {
    staffs.splice(index, 1);
    res.status(200).json({ status: "Success", newData: admins });
  } else {
    res.status(404).json({ status: "Error", message: "admin not found" });
  }
});

// Update a admin by ID
adminRoutes.patch("/admin/:id", (req, res) => {
  const id = req.params.id;
  const index = admins.findIndex((admin) => admin.admin_id == id);

  //condition of statement
  if (index !== -1) {
    admins[index] = { ...admins[index], ...req.body }; // Merging updates
    res.status(200).json({ status: "Success", newData: admins }); // if success!
  } else {
    res.status(404).json({ status: "Error", message: "admin not found" }); //if Error!
  }
});

module.exports = adminRoutes;
